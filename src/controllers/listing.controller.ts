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

    // validate request body
    if (!title || !description || !price || !address || !city || !state) {
      const error: ListingError = {
        message: "Please provide all required fields",
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

    const owner = userId._id as string;

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
      owner,
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
      .populate("owner", "fullname email role")
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

    // customize error if casting fails
    if (listingId && !listingId.match(/^[0-9a-fA-F]{24}$/)) {
      const error: ListingError = {
        message: "Invalid listing id",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // check if listing exists
    if (!listingId) {
      const error: ListingError = {
        message: "Please provide a listing id",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // Fetch Listing
    const listing = await Listing.findOne({ _id: listingId });

    if (!listing) {
      const error: ListingError = {
        message: "Listing does not exist.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    return successResponse(
      res,
      "Successful",
      listing as IListing,
      StatusCodes.OK
    );
  }
);

/**
 * @description Search for listings matching keyword
 * @route GET /listings/search
 * @param {Request<ParamsDictionary, unknown, unknown, ParsedQs>} req
 * @param {ListingResponse} res
 * @returns {Promise<ListingResponse | void>}
 * @throws {Error}
 */

export const searchListings = tryCatch(
  async (req: RequestObject, res: ListingResponse): Promise<unknown> => {
    // destructure the keyword from the query
    const { q } = req.query;
    const queryObject = {} as Record<string, unknown>;

    // check if query is provided
    if (!q) {
      const error: ListingError = {
        message: "Please provide a search query",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // search for listings
    if (q) {
      queryObject["$or"] = [
        { title: { $regex: q as string, $options: "i" } },
        { city: { $regex: q as string, $options: "i" } },
        { state: { $regex: q as string, $options: "i" } },
        { country: { $regex: q as string, $options: "i" } },
        { type: { $regex: q as string, $options: "i" } },
      ];
    }

    const listings = await Listing.find(queryObject);
    return successResponse(
      res,
      "Successful",
      listings as unknown as IListing,
      StatusCodes.OK
    );
  }
);

/**
 * @description Update Listing
 * @route PUT /listing/:listingId
 * @access Private
 * @param {Request<ParamsDictionary, unknown, RegisterListingRequestBody>} req
 * @param {ListingResponse} res
 * @returns {Promise<ListingResponse | void>}
 * @throws {Error}
 */

export const updateListing = tryCatch(
  async (req: RequestObject, res: ListingResponse): Promise<unknown> => {
    const { listingId } = req.params;
    const userId = (req as unknown as UserObject).user;

    const allowedUpdates = [
      "title",
      "description",
      "price",
      "address",
      "city",
      "state",
      "country",
      "status",
      "type",
      "bedroom",
      "bathroom",
      "amenities",
      "images",
    ];

    // fetch the listing
    const listing = await Listing.findOne({ _id: listingId });
    if (!listing) {
      const error: ListingError = {
        message: "Listing does not exist or does not belong to you.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // check if user owns the listing
    if (listing.owner.toString() !== (userId._id as string).toString()) {
      const error: ListingError = {
        message: "You are not authorized to update this listing",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // update images
    if (req.files) {
      // delete the old images from cloudinary
      for (const filename of listing.images.map((image) => image.filename)) {
        await cloudinary.uploader.destroy(filename);
      }

      const images = req.files as Express.Multer.File[];
      const uploadImages = images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.path);
        return { url: result.secure_url, filename: result.public_id };
      });
      listing.images = await Promise.all(uploadImages);
    }

    // update listing
    Object.keys(req.body as Record<string, unknown>).forEach((prop) => {
      if (allowedUpdates.includes(prop) && prop !== "images") {
        if (
          prop === "title" ||
          prop === "city" ||
          prop === "state" ||
          prop === "country"
        ) {
          const output = CapitalizeFirstLetter.capitalizeFirstLetter(
            listing[prop]
          );
          listing[prop] = output;
          return;
        }
        listing[prop] = (req.body as Record<string, unknown>)[prop];
      }
    });

    // save listing
    await listing.save();

    // return success response
    const data: IListing = listing;
    const success: SuccessResponseData<IListing> = {
      message: "Listing updated successfully",
      data,
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
 * @description Delete listing from the database
 * @route DELETE /listing/:listingId
 * @access Private
 * @param {Request<ParamsDictionary, unknown, unknown, ParsedQs>} req
 * @param {ListingResponse} res
 * @returns {Promise<ListingResponse | void>}
 */

export const deleteListing = tryCatch(
  async (req: RequestObject, res: ListingResponse): Promise<unknown> => {
    const { listingId } = req.params;
    const userId = (req as unknown as UserObject).user;

    // fetch the listing
    const listing = await Listing.findOne({ _id: listingId });
    if (!listing) {
      const error: ListingError = {
        message: "Listing does not exist.",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // check if user owns the listing
    if (listing.owner.toString() !== (userId._id as string).toString()) {
      const error: ListingError = {
        message: "You are not authorized to delete this listing",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    // delete the images from cloudinary
    for (const filename of listing.images.map((image) => image.filename)) {
      await cloudinary.uploader.destroy(filename);
    }

    // delete listing
    await listing.deleteOne();

    // return success response
    const success: SuccessResponseData<IListing> = {
      message: "Listing deleted successfully",
      data: {} as IListing,
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
 * @description Get All Listings by Pagination
 */
