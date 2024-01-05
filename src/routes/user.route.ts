import { Router } from "express";

// controllers
import * as userController from "../controllers/user.controller";

// middlewares
import * as userAuthorization from "../middlewares/authorization/user.authorization";

const userRouter: Router = Router();

// routes
userRouter.post(
  "/register",
  userAuthorization.authenticatedUser,
  userController.registerUser
);

export default userRouter;
