// import libraries
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { Listing } from "../models/listing.model";
import cloudinary from "../config/multer.config";

// import types
import {
  IListing,
  ListingError,
  ListingObject,
  ListingResponse,
  RegisterListingRequestBody,
} from "../@types/listing";
import { ErrorResponseData, SuccessResponseData } from "../@types/listing";

/**
 * @desc    class for listing controller
 * @class   ListingController
 * @public
 * @constructor
 * @param   {Request<ParamsDictionary, unknown, RegisterListingRequestBody, ParsedQs, Record<string, unknown>>} req
 * @param   {Response<SuccessResponseData<IListing> | ErrorResponseData>} res
 * @returns {void}
 */

export class ListingController {
  /**
   * @desc  method for creating a listing
   * @route POST /api/v1/listing
   * @access  Private
   * @param   {Request<ParamsDictionary, unknown, RegisterListingRequestBody, ParsedQs, Record<string, unknown>>} req
   * @param   {Response<SuccessResponseData<IListing> | ErrorResponseData>} res
   * @returns {void}
   */
  static createListing = tryCatch(
    async (
      req: Request<
        ParamsDictionary,
        unknown,
        RegisterListingRequestBody,
        ParsedQs,
        Record<string, unknown>
      >,
      res: ListingResponse
    ): Promise<void> => {
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

      const listing: IListing = await Listing.create({
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
      });

      successResponse(
        res,
        "Listing created successfully",
        listing,
        StatusCodes.CREATED
      );
    }
  );

  /**
   * @desc  method for getting all listings
   * @route GET /api/v1/listing
   * @access  Public
   * @param   {Request<ParamsDictionary, unknown, unknown, ParsedQs, Record<string, unknown>>} req
   * @param   {Response<SuccessResponseData<IListing[]> | ErrorResponseData>} res
   * @returns {void}
   */
  static getAllListings = tryCatch(
    async (
      _req: Request<
        ParamsDictionary,
        unknown,
        unknown,
        ParsedQs,
        Record<string, unknown>
      >,
      res: ListingResponse
    ): Promise<void> => {
      const listings: IListing[] = await Listing.find();

      successResponse(
        res,
        "Listings fetched successfully",
        listings,
        StatusCodes.OK
      );
    }
  );
}

//   /**
//    * @desc  method for getting a listing
//    * @route GET /api/v1/listing/:id
//    * @access  Public
//    * @param   {Request<ParamsDictionary, unknown, unknown, ParsedQs, Record<string, unknown>>} req
//    * @param   {Response<SuccessResponseData<IListing> | ErrorResponseData>} res
//    * @returns {void}
//    * @todo    add error handling for invalid id
//    * @todo    add error handling for listing not found
//    * @todo    add error handling for invalid id
//    * @todo    add error handling for listing not found
// * /

//     static getListing = tryCatch(
//         async (
//         req: Request<ParamsDictionary, unknown, unknown, ParsedQs, Record<string, unknown>>,
//         res: ListingResponse
//         ): Promise<void> => {
//         const listing: IListing = await Listing.findById(req.params.id);

//         successResponse(res, "Listing fetched successfully", listing, StatusCodes.OK);
//         }
//     );

//     /**
//      * @desc  method for updating a listing
//      * @route PUT /api/v1/listing/:id
//      * @access  Private
//      * @param   {Request<ParamsDictionary, unknown, RegisterListingRequestBody, ParsedQs, Record<string, unknown>>} req
//      * @param   {Response<SuccessResponseData<IListing> | ErrorResponseData>} res
//      * @returns {void}
//      * @todo    add error handling for invalid id
//      * @todo    add error handling for listing not found
//      * @todo    add error handling for invalid id
//      * @todo    add error handling for listing not found
