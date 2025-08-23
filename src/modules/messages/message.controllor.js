import express from "express";
import * as message_serv from "./services/message.services.js";
import verifyToken from "../../middlewares/auth.middlewares.js";

const router = express.Router();

router.post("/send/:reciverId",verifyToken ,message_serv.sendmessage);
router.post("/reply/:messageId", verifyToken, message_serv.replayMessage);
router.get("/userMessages", verifyToken, message_serv.userMessages);

export default router;
