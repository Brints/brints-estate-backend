/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";
import { multerConfig } from "../config/multer.config";

const upload = multerConfig.array("images", 5);

// controllers
import * as listingController from "../controllers/listing.controller";

// authorization
import * as userAuthorization from "../middlewares/authorization/user.authorization";

// validators

const listingRouter: Router = Router();

// routes
listingRouter.post(
  "/create",
  upload,
  userAuthorization.authenticatedUser,
  listingController.createListing
);
listingRouter.get(
  "/all",
  userAuthorization.authenticatedUser,
  listingController.getAllListings
);

export default listingRouter;
