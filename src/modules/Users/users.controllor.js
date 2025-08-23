import express from "express";
import * as user_serv from "./services/users.services.js";
import verifyToken from "../../middlewares/auth.middlewares.js";
import { validationAdmin } from "../../middlewares/auth.middlewares.js";
import { validate } from "../../middlewares/validation.middleware.js";
import {
  loginSchema,
  resendOTPSchema,
  resetPassSchema,
  SignupSchema,
  updatePassSchema,
  updateSchema,
} from "../../validators.js/user.validators.js";
import { limitter, limitterOTP } from "../../utils/rateLimit.js";
import { cloudFileUpload } from "../../utils/cloud.js";

const router = express.Router();

router.post("/register", validate(SignupSchema), user_serv.signup);
router.post("/signup", user_serv.signWithGoogle);
router.post("/confirmotp", limitterOTP, user_serv.confrim_email);
router.get("/resendOTP", validate(resendOTPSchema), user_serv.resendOTP);
router.post("/login", validate(loginSchema), limitter, user_serv.loginuser);
router.post(
  "/photo",
  verifyToken,
  cloudFileUpload.single("image"),
  user_serv.uploadphoto
);
router.get("/refresh", user_serv.refreshToken);
router.get("/search/:id", verifyToken, user_serv.gertuser);
router.get("/profile", verifyToken, user_serv.profile);
router.get("/notifications", verifyToken, user_serv.Notifications);
router.get("/editpasswordreq", verifyToken, user_serv.resetPasswordreq);
router.get("/password/resendOTP", verifyToken, user_serv.resendOTP_reset);
router.put(
  "/updatpassword",
  verifyToken,
  validate(updatePassSchema),
  user_serv.updatePassword
);
router.put(
  "/updateprofile",
  verifyToken,
  validate(updateSchema),
  user_serv.updateuser
);
router.put(
  "/passwordconfirm",
  verifyToken,
  validate(resetPassSchema),
  limitterOTP,
  user_serv.resetPasswordconfrim
);
router.delete("/deleteaccount", verifyToken, user_serv.deleteuser);
router.delete("/logout", verifyToken, user_serv.logout);
router.delete("/logoutAlldevices", verifyToken, user_serv.logoutAllDevices);
//admin

router.get("/list", verifyToken, validationAdmin, user_serv.gertusers);

export default router;
/*
  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTllNDlhNmRhZDQ3ZTE0NjU2ZjAxOSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU1OTY0ODgyLCJleHAiOjE3NTU5NjY2ODJ9.KAEPJMBfFDSwOrY5t4lWGD7tAMMEsWWOik9El9bKIfA
  
  
  
  
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YTllNDlhNmRhZDQ3ZTE0NjU2ZjAxOSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNzU1OTY1MjA1LCJleHAiOjE3NTU5NjcwMDV9.BjsiELoJ-4Mffy3StgzK8ctjchtJ6qfXBxXDyRQiJ7I
  */