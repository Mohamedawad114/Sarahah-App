import asyncHandler from "express-async-handler";
import user from "../../../DB/models/users.model.js";
import message from "../../../DB/models/message.model.js";
import notification from "../../../DB/models/notification.model.js";

export const sendmessage = asyncHandler(async (req, res) => {
  const reciverId = req.params.reciverId;
  const reciver = await user.findOne({ _id: reciverId, isconfirmed: true });
  if (!reciver) return res.status(404).json({ message: ` reciver not found ` });
  const { content } = req.body;
  if (!content) return res.status(400).send(`content is required`);
  const Message = new message({
    content,
    reciverId,
    senderId:req.user.id
  });
  await Message.save();
  await notification.create({ userId: reciverId, messageId: Message._id });
  return res.status(200).json({ message: `message sent` });
});
export const replayMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const Message = await message.findOne({ _id: messageId });
  if (!Message) return res.status(404).json({ message: ` message not found ` });
  if (Message.reciverId != req.user.id)
    return res.status(403).json({ message: "You can't reply to this message" });
  const { content } = req.body;
  if (!content) return res.status(400).send(`content is required`);

  const newMessage = new message({
    content,
    reciverId: Message.senderId,
    senderId: req.user.id,
  });
  await newMessage.save();
  await notification.create({
    messageId: newMessage._id,
    userId: Message.senderId,
  });
  return res.status(200).json({ message: `message sent` });
});

export const userMessages = asyncHandler(async (req, res) => {
  const id = req.user.id;
  const User = await user.findById(id);
  if (!User) return res.status(404).json({ message: `User not found` });
  const Messages = await message.find({ reciverId: id }, { senderId: 0 ,reciverId:0});
  if (Messages.length > 0) {
    return res.status(200).json({ Messages });
  }
  return res.status(200).json({ message: ` no message yet` });
});
