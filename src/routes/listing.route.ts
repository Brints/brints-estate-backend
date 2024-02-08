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
listingRouter.get(
  "/search",
  userAuthorization.authenticatedUser,
  listingController.searchListings
);
listingRouter.get(
  "/:listingId",
  userAuthorization.authenticatedUser,
  listingController.getSingleListing
);
listingRouter.put(
  "/:listingId",
  userAuthorization.authenticatedUser,
  listingController.updateListing
);
listingRouter.delete(
  "/:listingId",
  userAuthorization.authenticatedUser,
  listingController.deleteListing
);
listingRouter.get(
  "/my-listings",
  userAuthorization.authenticatedUser,
  listingController.getMyListings
);

export default listingRouter;
