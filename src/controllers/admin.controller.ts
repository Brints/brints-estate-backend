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

/**
 * @desc    Create about
 * @route   POST /about
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 */
type AboutRequestObject = Request<unknown, unknown, AboutRequestBody, unknown>;

export const createAbout = tryCatch(
  async (
    req: AboutRequestObject,
    res: ResponseObject<IAbout>
  ): Promise<unknown> => {
    const { title, content, image } = req.body;

    const user = (req as unknown as UserObject).user;

    if (user.role !== "admin") {
      const error: ResponseError = {
        message: "Only admins can do this.",
        statusCode: StatusCodes.FORBIDDEN,
      };
      return errorResponse(res, error.message, error.statusCode);
    }

    if (!user.verified) {
      const error: ResponseError = {
        message: "Please verify your account.",
        statusCode: StatusCodes.UNAUTHORIZED,
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
      const { image } = req.files as { image: Express.Multer.File[] };

      const imagePromises = image.map((img) => {
        return cloudinary.uploader.upload(img.path);
      });

      const imageResults = await Promise.all(imagePromises);

      about.image = imageResults.map((img) => {
        return { url: img.secure_url, filename: img.public_id };
      });
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
