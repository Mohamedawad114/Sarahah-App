import nodemailer from "nodemailer";
import { EventEmitter } from "node:events";
import bcrypt from "bcrypt";
import redis from "./redis.js";
import { customAlphabet } from "nanoid";
const generateOTP = customAlphabet("0123456789mnbvwqcxasfdgoje", 6);
const salt = await bcrypt.genSalt(10);

async function SendEmail({ to, subject, html }) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.APP_GMAIL,
        pass: process.env.APP_PASSWORD,
      },
    });

    const Info = await transporter.sendMail({
      from: process.env.APP_GMAIL,
      to: to,
      subject: subject,
      html: html,
    });
    console.log(Info.response);
  } catch (err) {
    console.log(err);
  }
}

export const emittir = new EventEmitter();
emittir.on("sendemail", (args) => {
  SendEmail(args);
});

const createAndSendOTP = async (User, email) => {
  let OTP = generateOTP();

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f2f2f2;">
      <div style="max-width: 600px; margin: auto; background-color: #fff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h2 style="color: #333;">مرحبا بك!</h2>
        <p>شكراً لتسجيلك. الكود الخاص بك لتأكيد الحساب هو:</p>
        <h1 style="color: #007BFF; text-align: center;">${OTP}</h1>
        <p>من فضلك أدخل هذا الكود في التطبيق لتفعيل حسابك.</p>
        <hr />
        <p style="font-size: 12px; color: #888;">إذا لم تطلب هذا الكود، تجاهل هذه الرسالة.</p>
      </div>
    </div>
  `;
  OTP = await bcrypt.hash(OTP, salt);
  await redis.set(`otp_${email}`, OTP, "EX", 2 * 60);
  emittir.emit("sendemail", { to: email, subject: "confirmation email", html });
};
const createAndSendOTP_Password = async (User, email) => {
  let OTP = generateOTP();
  const resetHtml = `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
  <div style="max-width: 600px; margin: auto; background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
    <h2 style="color: #333;">طلب إعادة تعيين كلمة المرور</h2>
    <p style="font-size: 16px; color: #555;">لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. من فضلك استخدم رمز التحقق (OTP) أدناه لإتمام العملية:</p>
    <div style="margin: 20px 0; padding: 20px; background-color: #f1f5ff; border-radius: 8px; text-align: center;">
      <h1 style="font-size: 36px; letter-spacing: 4px; color: #007BFF;">${OTP}</h1>
    </div>
    <p style="font-size: 14px; color: #777;">الرمز صالح لفترة محدودة فقط. إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان.</p>
    <hr style="margin-top: 30px;" />
    <p style="font-size: 12px; color: #999;">© 2025 Notes. جميع الحقوق محفوظة.</p> 
  </div>
</div>`;
  OTP = await bcrypt.hash(OTP, salt);

  await redis.set(`otp_rest:${email}`, OTP, "EX", 60 * 10);
  emittir.emit("sendemail", {
    to: email,
    subject: "Reset Password",
    html: resetHtml,
  });
};

export { SendEmail, createAndSendOTP, createAndSendOTP_Password };
