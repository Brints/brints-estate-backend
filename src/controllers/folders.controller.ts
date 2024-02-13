import { Request } from "express";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { Folder } from "../models/folders.model";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { UserObject } from "../@types";

// import types
import {
  FolderResponse,
  //FolderRequestBody,
  FolderError,
  IFolder,
} from "../@types/folders";

/**
 * @desc    Create folder
 * @route   POST /folders
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 */

type FolderRequestObject = Request<
  ParamsDictionary,
  unknown,
  unknown,
  ParsedQs,
  Record<string, unknown>
>;

export const createFolder = tryCatch(
  async (req: FolderRequestObject, res: FolderResponse): Promise<unknown> => {
    const { name } = req.body as { name: string };
    const user = (req as unknown as UserObject).user;

    const folderExists = await Folder.findOne({
      name,
      user: user._id as string,
    });
    if (folderExists) {
      const err: FolderError = {
        message: "Folder already exists.",
        statusCode: StatusCodes.CONFLICT,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const folder = new Folder({ name, user: user._id as string });
    await folder.save();

    return successResponse(
      res,
      "Folder created successfully.",
      folder as IFolder,
      StatusCodes.CREATED
    );
  }
);

/**
 * @desc    Get all folders
 * @route   GET /folders
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 * @returns {Promise<unknown>}
 */
