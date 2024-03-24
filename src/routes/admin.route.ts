/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { multerConfig } from "../config/multer.config";

const upload = multerConfig.array("image", 2);

// import * as adminController from "../controllers/admin.controller";

import { AboutController } from "../controllers/admin.controller";

import * as authMiddleware from "../middlewares/authorization/user.authorization";

// validators here

const adminRouter: Router = Router();

// routes
class AdminRouter {
  static routes(): Router {
    adminRouter.post(
      "/about/add",
      authMiddleware.authenticatedUser,
      upload,
      AboutController.createAbout
    );
    adminRouter.get("/about-us", AboutController.getAbout);

    return adminRouter;
  }
}

export default AdminRouter.routes();
