import { Request } from "express";
import { StatusCodes } from "http-status-codes";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
// import {Admin} from "../models/admin.model"
import About from "../models/about.model";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { cloudinary } from "../config/multer.config";

// import types
import { UserObject } from "../@types";
import { AboutRequestBody, IAbout } from "../@types/about";
import { ResponseObject, ResponseError } from "../@types/base";
import mongoose from "mongoose";

/**
 * @description A class that contains all the controller methods for about us
 * @class AboutController
 * @method createAbout
 * @method getAbout
 * @method updateAbout
 * @method deleteAbout
 * @access private
 * @static
 * @returns {object} response
 * @returns {object} error
 * @returns {object} about
 */

type RequestObject = Request<unknown, unknown, AboutRequestBody, unknown>;
type GetAbout = Request<unknown, unknown, unknown, unknown>;

export class AboutController {
  /**
   * @desc    Create about
   * @route   POST /about
   * @param  {Request} req
   * @param  {Response} res
   * @access  Private
   */
  static createAbout = tryCatch(
    async (
      req: RequestObject,
      res: ResponseObject<IAbout>
    ): Promise<unknown> => {
      const { title, content, image } = req.body;

      const userId = (req as unknown as UserObject).user;

      if (!userId) {
        const error: ResponseError = {
          message: "You have to be logged in.",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      if (userId.role !== "admin") {
        const error: ResponseError = {
          message: "Only admins can do this.",
          statusCode: StatusCodes.FORBIDDEN,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      if (!userId.verified) {
        const error: ResponseError = {
          message: "Please verify your account.",
          statusCode: StatusCodes.UNAUTHORIZED,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      //   check if an about us already exists
      const aboutUs = await About.find();
      if (aboutUs.length > 0) {
        const error: ResponseError = {
          message: "There can only be one about us.",
          statusCode: StatusCodes.CONFLICT,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      const about = await About.create({
        title,
        content,
        image,
      });

      // save image to cloudinary
      if (req.files) {
        const images = req.files as Express.Multer.File[];
        const uploadImages = images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image.path);
          return { url: result.secure_url, filename: result.public_id };
        });

        const imageResults = await Promise.all(uploadImages);
        about.image = imageResults;
      }

      await about.save();

      return successResponse(
        res,
        "Successfully created",
        about,
        StatusCodes.CREATED
      );
    }
  );

  /**
   * @desc    Get about
   * @route   GET /about
   * @param  {Request} req
   * @param  {Response} res
   * @access  Private
   */

  static getAbout = tryCatch(
    async (req: GetAbout, res: ResponseObject<IAbout>): Promise<unknown> => {
      const { aboutId } = req.params as { aboutId: string };

      if (!aboutId) {
        const error: ResponseError = {
          message: "You have to provide an id.",
          statusCode: StatusCodes.BAD_REQUEST,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      if (!mongoose.Types.ObjectId.isValid(aboutId)) {
        const error: ResponseError = {
          message: "Provide a valid id",
          statusCode: StatusCodes.BAD_REQUEST,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      const about = await About.findOne({ _id: aboutId });

      if (!about) {
        const error: ResponseError = {
          message: "About not found",
          statusCode: StatusCodes.NOT_FOUND,
        };
        return errorResponse(res, error.message, error.statusCode);
      }

      return successResponse(
        res,
        "Successfully fetched",
        about as IAbout,
        StatusCodes.OK
      );
    }
  );
}

// /**
//  * @desc    Create about
//  * @route   POST /about
//  * @param  {Request} req
//  * @param  {Response} res
//  * @access  Private
//  */
// type AboutRequestObject = Request<unknown, unknown, AboutRequestBody, unknown>;

// export const createAbout = tryCatch(
//   async (
//     req: AboutRequestObject,
//     res: ResponseObject<IAbout>
//   ): Promise<unknown> => {
//     const { title, content, image } = req.body;

//     const user = (req as unknown as UserObject).user;

//     if (user.role !== "admin") {
//       const error: ResponseError = {
//         message: "Only admins can do this.",
//         statusCode: StatusCodes.FORBIDDEN,
//       };
//       return errorResponse(res, error.message, error.statusCode);
//     }

//     if (!user.verified) {
//       const error: ResponseError = {
//         message: "Please verify your account.",
//         statusCode: StatusCodes.UNAUTHORIZED,
//       };
//       return errorResponse(res, error.message, error.statusCode);
//     }

//     const about = await About.create({
//       title,
//       content,
//       image,
//     });

//     // save image to cloudinary
//     if (req.files) {
//       const { image } = req.files as { image: Express.Multer.File[] };

//       const imagePromises = image.map((img) => {
//         return cloudinary.uploader.upload(img.path);
//       });

//       const imageResults = await Promise.all(imagePromises);

//       about.image = imageResults.map((img) => {
//         return { url: img.secure_url, filename: img.public_id };
//       });
//     }

//     await about.save();

//     return successResponse(
//       res,
//       "Successfully created",
//       about,
//       StatusCodes.CREATED
//     );
//   }
// );

// /**
//  * @desc    Get about
//  * @route   GET /about
//  * @param  {Request} req
//  * @param  {Response} res
//  * @access  Private
//  */

// type GetAbout = Request<unknown, unknown, unknown, unknown>;
