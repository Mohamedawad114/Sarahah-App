import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      request: true,
    },
    reciverId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    senderId:{
      type:mongoose.Types.ObjectId,
      ref:"User",
    }
  },
  {
    timestamps: true,
  }
);

const message = mongoose.model("message", messageSchema);

export default message;
