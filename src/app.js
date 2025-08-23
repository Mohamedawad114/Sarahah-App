import db_connection from "./DB/db.connection.js";
import user_router from "./modules/Users/users.controllor.js";
import message_router from "./modules/messages/message.controllor.js";
import express from "express";
import helmet from "helmet";
import env from "dotenv";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
const app = express();
app.use(helmet());
env.config();
app.use(hpp());
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:4200",
  })
);


app.use("/users", user_router);
app.use("/", message_router);

await db_connection();

app.use(async (err, req, res, next) => {
  if (req.session && req.session.inTransaction()) {
    await req.session.abortTransaction();
    req.session.endSession();
  }
  res
    .status(err.cause || 500)
    .json({ message: `something broke`, err: err.message, stack: err.stack });
});

app.use((req, res) => {
  res.status(404).json({ message: `Page Not Found` });
});

export default app;
