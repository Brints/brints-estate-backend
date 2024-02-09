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
  FavoriteError,
  IFavorite,
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

    // user cannot favorite their own listing
    if (listing.owner.toString() === (user._id as string).toString()) {
      const err: FavoriteError = {
        message: "You cannot favorite your own listing.",
        statusCode: StatusCodes.BAD_REQUEST,
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

/**
 * @desc    Get all favorites
 * @route   GET /favorites
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 */

export const getAllFavorites = tryCatch(
  async (req: FavoriteObject, res: FavoriteResponse): Promise<unknown> => {
    const user = (req as unknown as UserObject).user;

    const favorites = await ListingFavorite.find({
      user: user._id as string,
    }).populate({
      path: "listing",
      select: "title description price",
    });
    if (!favorites) {
      const err: FavoriteError = {
        message: "No favorites found.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    return successResponse(
      res,
      "All favorites",
      favorites as unknown as IFavorite,
      StatusCodes.OK
    );
  }
);

/**
 * @desc    Remove favorite
 * @route   DELETE /:favoriteId/favorites
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 */

export const removeFavorite = tryCatch(
  async (req: FavoriteObject, res: FavoriteResponse): Promise<unknown> => {
    const { favoriteId } = req.params as { favoriteId: string };
    const user = (req as unknown as UserObject).user;

    // check if casting the favoriteId fails
    if (favoriteId && !favoriteId.match(/^[0-9a-fA-F]{24}$/)) {
      const err: FavoriteError = {
        message: "Invalid favorite id.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const favorite = await ListingFavorite.findOne({
      _id: favoriteId,
      user: user._id as string,
    })
      .populate("listing")
      .exec();
    if (!favorite) {
      const err: FavoriteError = {
        message: "Favorite does not exist.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    await favorite.deleteOne();

    return successResponse(
      res,
      "Favorite removed",
      null as unknown as IFavorite,
      StatusCodes.OK
    );
  }
);
