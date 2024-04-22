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
import { FolderResponse, FolderError, IFolder } from "../@types/folders";

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

export const getFolders = tryCatch(
  async (req: FolderRequestObject, res: FolderResponse): Promise<unknown> => {
    const user = (req as unknown as UserObject).user;
    const folders = await Folder.find({ user: user._id as string });

    return successResponse(
      res,
      "Folders retrieved successfully.",
      folders as unknown as IFolder,
      StatusCodes.OK
    );
  }
);

/**
 * @desc    Get single folders
 * @route   GET /folder
 * @param  {Request} req
 * @param  {Response} res
 * @access  Private
 * @returns {Promise<unknown>}
 */

// export const getFolder = tryCatch(async fu)

export const getFolder = tryCatch(async function (
  req: FolderRequestObject,
  res: FolderResponse
): Promise<unknown> {
  const { folderId } = req.params;
  // const user = (req as unknown as UserObject).user

  if (!folderId) {
    const error: FolderError = {
      message: "Provide a Folder Id.",
      statusCode: StatusCodes.BAD_REQUEST,
    };
    return errorResponse(res, error.message, error.statusCode);
  }

  const folder = await Folder.findOne({ _id: folderId });

  return successResponse(res, "Successful", folder as IFolder, StatusCodes.OK);
});
