import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { User, IUser } from "../models/user.model";
import {
  SuccessResponseData,
  ErrorResponseData,
} from "../utils/lib/response.lib";

/**
 * @description Register a new user
 * @route POST /users/register
 * @access Public
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 */

interface RegisterUserRequestBody {
  fullname: string;
  email: string;
  password: string;
  gender: string;
  phone: string;
  role: string;
}

interface RegisterUserError {
  message: string;
  statusCode: number;
}

type RegisterUser = Request<unknown, unknown, RegisterUserRequestBody, unknown>;

type RegisterUserResponse = Response<
  SuccessResponseData<IUser> | ErrorResponseData
>;

export const registerUser = tryCatch(
  async (req: RegisterUser, res: RegisterUserResponse) => {
    // Get user input
    const { fullname, email, phone, gender, password, role } = req.body;

    // Validate user input
    if (!fullname || !email) {
      const err: RegisterUserError = {
        message: "Please fill in all fields",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user already exist
    const user = await User.findOne({ email });
    if (user) {
      const err: RegisterUserError = {
        message: "User already exist",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Create user
    const newUser = await User.create({
      fullname,
      email,
      password,
      phone,
      role,
      gender,
    });

    // Return success response
    return successResponse<IUser>(
      res,
      "User registered successfully",
      newUser,
      StatusCodes.CREATED
    );
  }
);
