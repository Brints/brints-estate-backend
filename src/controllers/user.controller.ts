import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { User } from "../models/user.model";
import { IUser } from "../@types";
import BcryptHelper from "../utils/helpers/bcrypt.helper";
import { generateVerificationToken } from "../utils/lib/verification-token.lib";
import { emailService } from "../services/email.service";

// import interfaces
import { RegisterUserRequestBody, RegisterUserError } from "../@types";
import { SuccessResponseData, ErrorResponseData } from "../@types";

/**
 * @description Register a new user
 * @route POST /users/register
 * @access Public
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 */

type RegisterUser = Request<unknown, unknown, RegisterUserRequestBody, unknown>;

type RegisterUserResponse = Response<
  SuccessResponseData<IUser> | ErrorResponseData
>;

export const registerUser = tryCatch(
  async (req: RegisterUser, res: RegisterUserResponse) => {
    // Get user input
    const { fullname, email, phone, gender, password, confirmPassword } =
      req.body;

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

    // Check if password match
    if (password !== confirmPassword) {
      const err: RegisterUserError = {
        message: "Password does not match",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Hash user password
    const hashedPassword = await BcryptHelper.hashPassword(password);

    // Make user an admin if it is the first user
    const users = await User.find();
    const role = users.length === 0 ? "admin" : "user";

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Set verification token expire date to 3 hours
    const verificationTokenExpire = new Date();
    verificationTokenExpire.setHours(verificationTokenExpire.getHours() + 3);

    // time verification token expires in hours
    const expiration =
      Math.round(
        (verificationTokenExpire.getTime() - new Date().getTime()) / 3600000
      ) + " hours";

    // Create user
    const newUser: IUser = await User.create({
      fullname,
      email,
      password: hashedPassword,
      phone,
      role,
      gender,
      verificationToken,
      verificationTokenExpire,
    });

    // create verification url
    const verificationUrl = `${process.env["BASE_URL"]}/user/verify-email/${verificationToken}&email=${newUser.email}`;

    // Send verification email
    await emailService.sendEmail(
      newUser.email,
      "Verify your email",
      `<h2>Hello, <span style="color: crimson">${
        newUser.fullname.split(" ")[0]
      }</span></h2>
      <p>Thanks for creating an account with us. Please click the link below to verify your email address. Verification link expires in ${expiration}</p>
      <a href="${verificationUrl}" target="_blank" style="background-color: crimson; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a>`
    );

    // // remove password from response
    // const userResponse: IUser = omit(newUser.toObject(), ["password"]);

    // Return user object with few details
    const userResponse = {
      fullname: newUser.fullname,
      email: newUser.email,
      gender: newUser.gender,
      phone: newUser.phone,
      role: newUser.role,
      verified: newUser.verified,
      verificationToken: newUser.verificationToken,
      verificationTokenExpire: newUser.verificationTokenExpire,
    };

    // Return success response
    return successResponse(
      res,
      "User registered successfully",
      userResponse as IUser,
      StatusCodes.CREATED
    );
  }
);
