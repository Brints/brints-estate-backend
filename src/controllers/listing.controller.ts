// import libraries
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { UserObject } from "../@types";
import { Listing } from "../models/listing.model";
import { cloudinary } from "../config/multer.config";
import { CapitalizeFirstLetter } from "../utils/helpers/user.helper";
import { ListingHelper } from "../utils/helpers/user.helper";

// import types
import {
  IListing,
  ListingError,
  ListingResponse,
  RegisterListingRequestBody,
} from "../@types/listing";
import { SuccessResponseData } from "../@types/listing";

/**
 * @desc    Create new listing
 * @route   POST /listings/create
 * @access  Private
 * @param   {Request<ParamsDictionary, unknown, RegisterListingRequestBody>} req
 * @param   {ListingResponse} res
 * @returns {Promise<ListingResponse | void>}
 * @throws  {Error}
 * @todo    {Handle image upload}
 */

type CreateListingRequest = Request<
  unknown,
  unknown,
  RegisterListingRequestBody,
  unknown
>;

export const createListing = tryCatch(
  async (req: CreateListingRequest, res: ListingResponse): Promise<unknown> => {
    // destructure request body
    const {
      title,
      description,
      price,
      discount,
      address,
      city,
      state,
      country,
      status,
      type,
      bedroom,
      bathroom,
      amenities,
      images,
    } = req.body;

    // fetch the user from request object
    const userId = (req as unknown as UserObject).user;

    // set status to rent if not provided and type to apartment if not provided
    // if (!status) {
    //   status = "rent";
    // }

    // validate request body
    if (
      !title ||
      !description ||
      !price ||
      !address ||
      !city ||
      !state ||
      !country ||
      !status ||
      !type ||
      !bedroom ||
      !bathroom ||
      !amenities ||
      !images
    ) {
      const error: ListingError = {
        message: "Please fill in all fields",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // check if the user is a user
    if (userId.role === "user") {
      const error: ListingError = {
        message:
          "You are cannot create a listing. Upgrade to an agent/landlord account",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // convert the amenities string to array
    const amenitiesArray = amenities.split(",");
    const formattedAmenities = amenitiesArray.map((amenity) => amenity.trim());

    // capitalize the first letter of the state and city
    const formattedState = CapitalizeFirstLetter.capitalizeFirstLetter(state);
    const formattedCity = CapitalizeFirstLetter.capitalizeFirstLetter(city);
    const formattedCountry =
      CapitalizeFirstLetter.capitalizeFirstLetter(country);
    const formattedTitle = CapitalizeFirstLetter.capitalizeFirstLetter(title);

    // check if the description is more than 160 characters
    const descriptionLength =
      ListingHelper.descriptionNotMoreThan160Characters(description);
    if (descriptionLength > 160) {
      const error: ListingError = {
        message: "Description cannot be more than 160 characters",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // create new listing
    const listing = await Listing.create({
      title: formattedTitle,
      description,
      price,
      discount,
      address,
      city: formattedCity,
      state: formattedState,
      country: formattedCountry,
      status,
      type,
      bedroom,
      bathroom,
      amenities: formattedAmenities,
      images,
      owner: userId._id,
    });

    CapitalizeFirstLetter.capitalizeFirstLetter(type);
    CapitalizeFirstLetter.capitalizeFirstLetter(status);

    // upload images to cloudinary
    if (req.files) {
      //   const { images } = req.files as { images: Express.Multer.File[] };
      const images = req.files as Express.Multer.File[];
      const uploadImages = images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path);
        return { url: result.secure_url, filename: result.public_id };
      });
      listing.images = await Promise.all(uploadImages);
    }

    // save listing
    await listing.save();

    // return success response
    const data: IListing = listing;
    const success: SuccessResponseData<IListing> = {
      message: "Listing created successfully",
      data,
      statusCode: StatusCodes.CREATED,
    };
    return successResponse(
      res,
      success.message,
      success.data,
      success.statusCode
    );
  }
);

/**
 * @description Get All Listings by Pagination
 * @route GET /listings/all
 * @access Private
 * @param {Request<ParamsDictionary, unknown, unknown, ParsedQs>} req
 * @param {ListingResponse} res
 * @returns {Promise<ListingResponse | void>}
 * @throws {Error}
 */

type RequestObject = Request<
  ParamsDictionary,
  unknown,
  unknown,
  ParsedQs,
  Record<string, unknown>
>;

export const getAllListings = tryCatch(
  async (req: RequestObject, res: ListingResponse): Promise<unknown> => {
    // destructure request query
    // const { page, limit } = req.query as Record<string, unknown>;
    // const { page, limit } = req.query as { page: string; limit: string };
    const { page, limit } = req.query;

    // set default values for page and limit
    const pageNumber = page ? Number(page) : 1;
    const limitNumber = limit ? Number(limit) : 10;

    // check if user is logged in
    const userId = (req as unknown as UserObject).user;
    if (!userId) {
      const error: ListingError = {
        message: "Please login to view listings",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // fetch all listings
    const listings = await Listing.find()
      .populate("owner", "-password")
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .skip(limitNumber * (pageNumber - 1));

    // return success response
    const success: SuccessResponseData<IListing> = {
      message: "Listings fetched successfully",
      data: listings as unknown as IListing,
      statusCode: StatusCodes.OK,
    };
    return successResponse(
      res,
      success.message,
      success.data,
      success.statusCode
    );
  }
);

/**
 * @description Get Single Listing
 * @route GET /listing/:listingId
 * @access Private
 * @param {Request<ParamsDictionary, unknown, unknown, ParsedQs>} req
 * @param {ListingResponse} res
 * @returns {Promise<ListingResponse | void>}
 * @throws {Error}
 */

export const getSingleListing = tryCatch(
  async (req: RequestObject, res: ListingResponse): Promise<unknown> => {
    // destructure the id from the params
    const { listingId } = req.params;

    // check if listing exists
    if (!listingId) {
      const error: ListingError = {
        message: "Listing does not exist.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // Fetch Listing
    const listing = await Listing.findOne({ _id: listingId });

    return successResponse(
      res,
      "Successful",
      listing as IListing,
      StatusCodes.OK
    );
  }
);
