
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "new_message" },
    messageId: {
      type: mongoose.Schema.ObjectId,
      ref: "message",
      required: true,},
      isRead: {
        type: Boolean,
        default: false,
      },
    },
  {
    timestamps: true,
  }
);

const notification = mongoose.model("notification", notificationSchema);

export default notification;
