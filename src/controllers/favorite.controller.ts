import { Request } from "express";
import { StatusCodes } from "http-status-codes";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { ListingFavorite } from "../models/favorite.model";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { UserObject } from "../@types";
import { Listing } from "../models/listing.model";

// import types
import {
  FavoriteResponse,
  FavoriteRequestBody,
  //IFavorite,
  FavoriteError,
} from "../@types/favorite";

/**
 * @desc    Create favorite
 * @route   POST /:listingId/favorites
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 */

type FavoriteObject = Request<unknown, unknown, FavoriteRequestBody, unknown>;

export const createFavorite = tryCatch(
  async (req: FavoriteObject, res: FavoriteResponse): Promise<unknown> => {
    const { listingId } = req.params as { listingId: string };
    const user = (req as unknown as UserObject).user;

    const listing = await Listing.findOne({ _id: listingId });
    if (!listing) {
      const err: FavoriteError = {
        message: "Listing does not exist.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const listingFavoriteExists = await ListingFavorite.findOne({
      listing: listingId,
      user: user._id as string,
    });
    if (listingFavoriteExists) {
      const err: FavoriteError = {
        message: "Listing already saved in favorites.",
        statusCode: StatusCodes.CONFLICT,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const listingFavorite = await ListingFavorite.create({
      listing: listingId,
      user: user._id as string,
    });

    return successResponse(
      res,
      "Listing added to favorites",
      listingFavorite,
      StatusCodes.CREATED
    );
  }
);
