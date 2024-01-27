// import libraries
import { Request } from "express";
import { StatusCodes } from "http-status-codes";
// import { ParsedQs } from "qs";
// import { ParamsDictionary } from "express-serve-static-core";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { UserObject } from "../@types";
import { Listing } from "../models/listing.model";
import { cloudinary } from "../config/multer.config";

// import types
import {
  IListing,
  ListingError,
  ListingResponse,
  RegisterListingRequestBody,
} from "../@types/listing";
import { SuccessResponseData, ErrorResponseData } from "../@types/listing";

/**
 * @desc    Create new listing
 * @route   POST /api/listing/create
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
  async (req: CreateListingRequest, res: ListingResponse) => {
    // destructure request body
    const {
      title,
      description,
      price,
      discount,
      location,
      address,
      city,
      state,
      country,
      zipcode,
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
    if (
      !title ||
      !description ||
      !price ||
      !location ||
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

    // create new listing
    const listing = await Listing.create({
      title,
      description,
      price,
      discount,
      location,
      address,
      city,
      state,
      country,
      zipcode,
      status,
      type,
      bedroom,
      bathroom,
      amenities,
      images,
      owner: userId._id,
    });

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
