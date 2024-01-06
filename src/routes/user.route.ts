import { Router } from "express";

// controllers
import * as userController from "../controllers/user.controller";

// middlewares
// import * as userAuthorization from "../middlewares/authorization/user.authorization";

// validators
import { validateUserRegistration } from "../middlewares/validations/user.validation";

const userRouter: Router = Router();

// routes
userRouter.post(
  "/register",
  validateUserRegistration,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  userController.registerUser
);

export default userRouter;
