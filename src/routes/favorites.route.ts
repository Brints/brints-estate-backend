/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from "express";

import * as favoritesController from "../controllers/favorite.controller";
import * as userAuthorization from "../middlewares/authorization/user.authorization";

const favoriteRouter: Router = Router();

// routes
favoriteRouter.post(
  "/:listingId/favorite",
  userAuthorization.authenticatedUser,
  favoritesController.createFavorite
);
favoriteRouter.get(
  "/favorites",
  userAuthorization.authenticatedUser,
  favoritesController.getAllFavorites
);
favoriteRouter.delete(
  "/:favoriteId",
  userAuthorization.authenticatedUser,
  favoritesController.removeFavorite
);

export default favoriteRouter;
