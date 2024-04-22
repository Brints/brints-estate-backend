/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { multerConfig } from "../config/multer.config";

const upload = multerConfig.array("avatar", 5);

// controllers
import * as userController from "../controllers/user.controller";

// middlewares
import * as userAuthorization from "../middlewares/authorization/user.authorization";

// validators
import {
  validateUserRegistration,
  validateLogin,
  validateForgotPassword,
  validateVerifyEmail,
  validateResendVerificationToken,
  validateResetPassword,
  validateChangePassword,
} from "../middlewares/validations/user.validation";

const userRouter: Router = Router();

// routes
userRouter.post(
  "/register",
  upload,
  validateUserRegistration,
  userController.registerUser
);
userRouter.post("/google-signup", userController.googleSignUp);
userRouter.get(
  "/verify-email",
  validateVerifyEmail,
  userController.verifyEmail
);
userRouter.post("/verify-phone/:phone", userController.verifyPhoneNumber);
userRouter.post("/login", validateLogin, userController.loginUser);
userRouter.get(
  "/profile",
  userAuthorization.authenticatedUser,
  userController.getUserProfile
);
userRouter.put(
  "/profile",
  userAuthorization.authenticatedUser,
  upload,
  userController.updateUserProfile
);
userRouter.post(
  "/resend-verification-token",
  validateResendVerificationToken,
  userController.generateNewVerificationToken
);
userRouter.post(
  "/forgot-password",
  validateForgotPassword,
  userController.forgotPassword
);
userRouter.post(
  "/reset-password/:token/:email",
  validateResetPassword,
  userController.resetPassword
);
userRouter.post(
  "/change-password",
  userAuthorization.authenticatedUser,
  validateChangePassword,
  userController.changePassword
);
userRouter.post(
  "/profile/add-image",
  userAuthorization.authenticatedUser,
  upload,
  userController.addImageToUserProfile
);
userRouter.delete(
  "/profile/:userId",
  userAuthorization.authenticatedUser,
  userController.deleteUserProfile
);
userRouter.get(
  "/all",
  userAuthorization.authenticatedUser,
  userController.getAllUsers
);
userRouter.get(
  "/:id",
  userAuthorization.authenticatedUser,
  userController.getSingleUser
);
userRouter.put(
  "/:id/make-admin",
  userAuthorization.authenticatedUser,
  userController.makeUserAdmin
);

export default userRouter;
