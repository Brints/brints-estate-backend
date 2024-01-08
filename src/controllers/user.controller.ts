// import libraries
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { User } from "../models/user.model";
import BcryptHelper from "../utils/helpers/bcrypt.helper";
import { generateVerificationToken } from "../utils/lib/verification-token.lib";
import { emailService } from "../services/email.service";
import { CapitalizeFirstLetter } from "../utils/helpers/user.helper";
import { cloudinary } from "../config/multer.config";

// import interfaces
import { IUser } from "../@types";
import { RegisterUserRequestBody, RegisterUserError } from "../@types";
import { SuccessResponseData, ErrorResponseData } from "../@types";
import { verifyEmailParams } from "../@types";

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
    const { image, fullname, email, phone, gender, password, confirmPassword } =
      req.body;

    // validate user inputs
    if (
      !fullname ||
      !email ||
      !phone ||
      !gender ||
      !password ||
      !confirmPassword
    ) {
      const err: RegisterUserError = {
        message: "All fields are required",
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

    // Capitalize first letter of fullname
    const capitalizedFullname =
      CapitalizeFirstLetter.capitalizeFirstLetter(fullname);

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

    const resetPasswordExpire = null;
    const resetPasswordToken = "";

    // Create user
    const newUser: IUser = new User({
      image,
      fullname: capitalizedFullname,
      email,
      password: hashedPassword,
      phone,
      role,
      gender,
      verificationToken,
      verificationTokenExpire,
      resetPasswordExpire,
      resetPasswordToken,
    });

    // Upload images to cloudinary
    if (req.files) {
      const images = req.files as Express.Multer.File[];
      const imagesUrl = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image.path);
          return { url: result.secure_url, filename: result.public_id };
        })
      );
      newUser.image = imagesUrl;
    }

    // Save user to database
    await newUser.save();

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

    // Return user object with few details
    const userResponse = {
      image: newUser.image,
      fullname: newUser.fullname,
      email: newUser.email,
      gender: newUser.gender,
      phone: newUser.phone,
      role: newUser.role,
      verified: newUser.verified,
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

/**
 * @description Verify user email
 * @route GET /user/verify-email/:token&email=:email
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Public
 */

type VerifyEmail = Request<unknown, unknown, verifyEmailParams, unknown>;

type VerifyEmailResponse = Response<
  SuccessResponseData<IUser> | ErrorResponseData
>;

export const verifyEmail = tryCatch(
  async (req: VerifyEmail, res: VerifyEmailResponse) => {
    // Get token and email from request params
    const { token, email } = req.params as verifyEmailParams;

    // Check if token and email is provided
    if (!token || !email) {
      const err: RegisterUserError = {
        message: "Token and email is required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exist
    if (!user) {
      const err: RegisterUserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user is already verified
    if (user.verified) {
      const err: RegisterUserError = {
        message: "User is already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if verification token is valid
    if (user.verificationToken !== token) {
      const err: RegisterUserError = {
        message: "Invalid verification token",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if verification token is expired
    if (
      user.verificationTokenExpire &&
      user.verificationTokenExpire < new Date()
    ) {
      const err: RegisterUserError = {
        message: "Verification token has expired",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Set user verified to true
    user.verified = true;
    user.verificationToken = "";
    user.verificationTokenExpire = new Date();

    // Save user to database
    await user.save();

    // Return success response
    return successResponse(
      res,
      "User verified successfully",
      user as IUser,
      StatusCodes.OK
    );
  }
);
