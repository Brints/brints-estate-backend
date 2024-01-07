import { Router } from "express";
import { multerConfig } from "../config/multer.config";

const upload = multerConfig.array("image", 5);

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
  upload,
  validateUserRegistration,
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  userController.registerUser
);

export default userRouter;
