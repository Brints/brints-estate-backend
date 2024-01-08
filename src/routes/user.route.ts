/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { multerConfig } from "../config/multer.config";

const upload = multerConfig.array("image", 5);

// controllers
import * as userController from "../controllers/user.controller";

// middlewares
// import * as userAuthorization from "../middlewares/authorization/user.authorization";

// validators
import {
  validateUserRegistration,
  //validateVerifyEmail,
} from "../middlewares/validations/user.validation";

const userRouter: Router = Router();

// routes
userRouter.post(
  "/register",
  upload,
  validateUserRegistration,
  userController.registerUser
);
userRouter.get("/verify-email/:token/:email", userController.verifyEmail);
userRouter.post("/login", userController.loginUser);

export default userRouter;
