import asyncHandler from "express-async-handler";
import { OAuth2Client } from "google-auth-library";
import { v4 as uuidV4 } from "uuid";
import encrypt from "../../../utils/encryption.js";
import decrypt from "../../../utils/decryption.js";
import bcrypt from "bcrypt";
import user from "../../../DB/models/users.model.js";
import notification from "../../../DB/models/notification.model.js";
import jwt from "jsonwebtoken";
import redis from "../../../utils/redis.js";
import {
  SendEmail,
  createAndSendOTP,
  createAndSendOTP_Password,
  emittir,
} from "../../../utils/send-email.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import message from "../../../DB/models/message.model.js";
import { deleteFile, uploadfile } from "../../../utils/cloud.js";
dotenv.config();

export const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, password, email, role, age, gender, phone } =
    req.body;
  const valid_email = await user.findOne({ email });
  if (valid_email) throw new Error(`email already existed `, { cause: 409 });
  const create = await user.create({
    firstName,
    lastName,
    password: await bcrypt.hash(password, parseInt(process.env.SALT)),
    email,
    role,
    age,
    gender,
    phone: encrypt(phone),
  });
  if (create) await createAndSendOTP(create, email);
  return res.status(201).json({ message: `signup done,OTP send` });
});
export const confrim_email = asyncHandler(async (req, res) => {
  const { OTP, email } = req.body;
  const User = await user.findOne({ email: email, isconfirmed: false });
  if (!User)
    throw new Error(`email is already confirmed or not found`, { cause: 400 });
  if (!OTP) throw new Error(`OTP required`, { cause: 400 });
  const savedOTP = await redis.get(`otp_${email}`);
  if (!savedOTP) {
    throw new Error(`expire OTP`, { cause: 400 });
  }
  const isMAtch = await bcrypt.compare(OTP, savedOTP);
  if (!isMAtch) throw new Error(`invalid OTP`, { cause: 400 });
  User.isconfirmed = true;
  await redis.del(`otp_${email}`);
  await User.save();
  return res.status(200).json({ message: `email is confirmed ` });
});
export const resendOTP = asyncHandler(async (req, res) => {
  const email = req.query.email;
  const User = await user.findOne({ email: email, isconfirmed: false });
  if (!User) throw new Error(`email not found or confimed`, { cause: 404 });
  await createAndSendOTP(User, User.email);
  return res.status(200).send(`OTP sent`);
});

async function verifyloginGoogle(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken: idToken,
    audience: process.env.CLIENTID,
  });
  const payload = ticket.getPayload();
  return payload;
}
const generateTokens = async (res, userId, role = "user") => {
  const jti = uuidV4();
  await redis.set(
    `refreshToken:${userId}:${jti}`,
    "1",
    "EX",
    60 * 60 * 24 * 30
  );
  const accessToken = jwt.sign(
    { id: userId, role: role },
    process.env.SECRET_KEY,
    {
      expiresIn: "30m",
    }
  );
  const refreshToken = jwt.sign(
    { id: userId, jti, role: role },
    process.env.SECRET_KEY,
    {
      expiresIn: "30d",
    }
  );
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
  return accessToken;
};
export const signWithGoogle = asyncHandler(async (req, res) => {
  const { idToken } = req.body;
  const payload = await verifyloginGoogle(idToken);
  const { given_name, family_name, email, email_verified, sub } = payload;
  if (!email_verified) {
    throw new Error(`email not verified`, { cause: 400 });
  }
  const User = await user.findOne({ email, subId: sub });
  if (User) {
    const accessToken = await generateTokens(res, User._id);
    return res.status(200).json({ message: "Login successfully", accessToken });
  }
  const createdUser = await user.create({
    firstName: given_name,
    lastName: family_name,
    password: null,
    email: email,
    age: null,
    phone: null,
    provider: "google",
    subId: sub,
  });
  const accessToken = await generateTokens(res, createdUser._id);
  return res.status(201).json({ accessToken });
});

export const loginuser = asyncHandler(async (req, res) => {
  const key = process.env.SECRET_KEY;
  const { password, email } = req.body;
  const User = await user.findOne({ email });
  if (!User) {
    throw new Error(`email not found`, { cause: 404 });
  }
  const passMatch = await bcrypt.compare(password, User.password);
  if (!passMatch) throw new Error(`invalid Password`, { cause: 400 });
  const accessToken = await generateTokens(res, User._id, User.role);
  res.status(200).json({
    message: `login seccussfully`,
    accessToken,
  });
});
export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);
  jwt.verify(
    req.cookies.refreshToken,
    process.env.SECRET_KEY,
    async (err, decoded) => {
      if (err) {
        console.log(err);
        return res.sendStatus(403);
      }
      const isexisted = await redis.get(
        `refreshToken:${decoded.id}:${decoded.jti}`
      );
      if (!isexisted) return res.sendStatus(403);
      const accessToken = jwt.sign(
        { id: decoded.id, role: decoded.role },
        process.env.SECRET_KEY,
        { expiresIn: "30m" }
      );
      return res.json({ accessToken });
    }
  );
});
export const profile = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const userProfile = await user.findById(id, {
    __v: 0,
    role: 0,
    password: 0,
  });
  if (!userProfile) throw new Error(`user not found`, { cause: 404 });
  if (userProfile.phone) {
    userProfile.phone = decrypt(userProfile.phone);
  }
  return res.status(200).json({ userProfile });
});
export const Notifications = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const User = await user.findById(id);
  if (!User) throw new Error(`user not found`, { cause: 404 });
  const notifications = await notification
    .find({ userId: id, isRead: false }, { isRead: 0, userId: 0 })
    .populate({ path: "messageId", select: "content" })
    .sort({ createdAt: -1 });
  await notification.updateMany(
    { userId: id, isRead: false },
    { $set: { isRead: true } }
  );
  return res.status(200).json({ notifications });
});

export const updateuser = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const { firstName, lastName, email, phone } = req.body;
  if (email) {
    const valid_email = await user.findOne({ email: email });
    if (valid_email) throw new Error(`email already existed`, { cause: 409 });
  }
  if (phone) {
    phone = encrypt(phone);
  }
  const findUser = await user.findByIdAndUpdate(id, {
    firstName,
    lastName,
    email,
    phone: phone,
  });
  if (!findUser) throw new Error(`user not found`, { cause: 404 });
  return res.status(200).json({ message: `profile updated` });
});

export const updatePassword = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const User = await user.findById(id);
  if (!User) throw new Error(`user not found`, { cause: 404 });
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword)
    throw new Error(`all input required`, { cause: 400 });
  const isMatch = await bcrypt.compare(oldPassword, User.password);
  if (!isMatch) throw new Error(`invalid oldPasword`, { cause: 400 });
  User.password = await bcrypt.hash(newPassword, parseInt(process.env.SALT));
  await User.save();
  const keys = await redis.keys(`refreshToken:${id}:*`);
  if (keys.length) await redis.del(keys);
  return res.status(200).json({ message: `password updated` });
});

export const resetPasswordreq = asyncHandler(async (req, res) => {
  const User = await user.findById(req.user.id);
  if (!User) throw new Error(`user not found`, { cause: 404 });
  createAndSendOTP_Password(User, User.email);
  return res.status(200).json({ message: `OTP is sent` });
});

export const resetPasswordconfrim = asyncHandler(async (req, res) => {
  const User = await user.findById(req.user.id);
  const { OTP, newPassword } = req.body;
  if (!OTP || !newPassword)
    throw new Error(`Both OTP and new passwords are required`, { cause: 400 });
  const savedOTP = await redis.get(`otp_rest:${User.email}`);
  if (!savedOTP) {
    throw new Error(`expire OTP.`, { cause: 400 });
  }
  const isMatch = await bcrypt.compare(OTP, savedOTP);
  if (!isMatch) throw new Error(`Invalid OTP`, { cause: 400 });
  const salt = parseInt(process.env.SALT);
  const hashpassword = await bcrypt.hash(newPassword, salt);
  User.password = hashpassword;
  await redis.del(`otp_rest:${User.email}`);
  await User.save();
  const keys = await redis.keys(`refreshToken:${User.id}:*`);
  if (keys.length) await redis.del(keys);
  return res.status(200).json({ message: `password updated` });
});

export const resendOTP_reset = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const User = await user.findById(id);
  if (!User) throw new Error(`email not found`, { cause: 404 });
  createAndSendOTP_Password(User, User.email);
  return res.status(200).send(`OTP sent`);
});
export const uploadphoto = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const User = await user.findById(id);
  if (!User) throw new Error(`user not found`, { cause: 404 });
  const file = req.file;
  if (!file) throw new Error(`file reguired`, { cause: 400 });
  const { secure_url, public_id } = await uploadfile({ file, path: `${id}` });
  if (User.image?.public_id) await deleteFile(User.image.public_id);
  User.image.url = secure_url;
  User.image.public_id = public_id;
  await User.save();
  return res.status(200).json({ message: `photo uploaded` });
});
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (!err && decoded.jti) {
      await redis.del(`refreshToken:${decoded.id}:${decoded.jti}`);
    }
    res.clearCookie("refreshToken").sendStatus(204);
  });
});
export const logoutAllDevices = asyncHandler(async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(204);
  jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
    if (!err && decoded.jti) {
      const keys = await redis.keys(`refreshToken:${decoded.id}:*`);
      if (keys.length) await redis.del(keys);
    }
    res.clearCookie("refreshToken").sendStatus(204);
  });
});
export const deleteuser = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  const id = req.user.id;
  req.session = session;
  session.startTransaction();
  const deleted = await user.findByIdAndDelete(id, { session });
  if (!deleted) throw new Error(`user not found`, { cause: 404 });
  await message.deleteMany({ reciverId: id }, { session });
  await notification.deleteMany({ userId: id }, { session });
  await session.commitTransaction();
  const keys = await redis.keys(`refreshToken:${id}:*`);
  if (keys.length) await redis.del(keys);
  res.clearCookie("refreshToken").json({ message: `account deleted` });
  session.endSession();
});

export const gertusers = asyncHandler(async (req, res) => {
  const page_num = parseInt(req.query.page);
  const limit = 5;
  const offest = (page_num - 1) * limit;
  let Users = await user
    .find({ role: "user" }, { password: 0 })
    .populate({ path: "Messages" })
    .skip(offest)
    .limit(limit);
  Users = Users.map((user) => {
    return {
      ...user._doc,
      phone: decrypt(user.phone),
    };
  });
  if (Users.length == 0) {
    return res.status(200).json({ message: "no Users yet" });
  }
  return res.status(200).json({ Users });
});
export const gertuser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const Usersearch = await user.findById(id, {
    password: 0,
    phone: 0,
    updatedAt: 0,
    __v: 0,
    role: 0,
  });
  if (!Usersearch) return res.status(404).json({ message: `User not found` });
  return res.status(200).json({ Usersearch });
});
