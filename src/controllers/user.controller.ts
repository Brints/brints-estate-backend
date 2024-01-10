// import libraries
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { User } from "../models/user.model";
import BcryptHelper from "../utils/helpers/bcrypt.helper";
import { generateVerificationToken } from "../utils/lib/verification-token.lib";
import { emailService } from "../services/email.service";
import { CapitalizeFirstLetter } from "../utils/helpers/user.helper";
import { cloudinary } from "../config/multer.config";
import { generateToken } from "../utils/helpers/jwt.helper";

// import interfaces
import { IUser, UserResponse } from "../@types";
import { RegisterUserRequestBody, UserError } from "../@types";
import { SuccessResponseData, ErrorResponseData } from "../@types";
import { verifyEmailParams } from "../@types";
import { SuccessResponseDataWithToken } from "../@types";
import { UserObject } from "../@types";

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

export const registerUser = tryCatch(
  async (req: RegisterUser, res: UserResponse) => {
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
      const err: UserError = {
        message: "All fields are required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user already exist
    const user = await User.findOne({ email });
    if (user) {
      const err: UserError = {
        message: "User already exist",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if password match
    if (password !== confirmPassword) {
      const err: UserError = {
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
      last_login: null,
      verified: false,
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
    const verificationUrl = `${process.env["BASE_URL"]}/user/verify-email/${verificationToken}/${newUser.email}`;

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
      last_login: newUser.last_login,
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

export const verifyEmail = tryCatch(
  async (req: VerifyEmail, res: UserResponse) => {
    // Get token and email from request params
    const { token, email }: verifyEmailParams = req.params as verifyEmailParams;

    // Check if token and email is provided
    if (!token || !email) {
      const err: UserError = {
        message: "Token and email is required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exist
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user is already verified
    if (user.verified) {
      const err: UserError = {
        message: "User is already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if verification token is valid
    if (user.verificationToken !== token) {
      const err: UserError = {
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
      const err: UserError = {
        message: "Verification token has expired",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    console.log(user.verificationTokenExpire);

    // Set user verified to true
    user.verified = true;
    user.verificationToken = "";
    user.verificationTokenExpire = null;

    // Save user to database
    await user.save();

    // TODO: Send welcome email
    await emailService.sendEmail(
      user.email,
      "Welcome to Brints Estate",
      `<h2>Hello, <span style="color: crimson">${
        user.fullname.split(" ")[0]
      }</span></h2>
      <p>Thanks for joining Brints Estate. We are glad to have you here.</p>`
    );

    // TODO: user details to be returned
    // const userResponse = {
    //   image: user.image,
    //   fullname: user.fullname,
    //   email: user.email,
    //   gender: user.gender,
    //   phone: user.phone,
    //   role: user.role,
    //   verified: user.verified,
    // };

    // Return success response
    return successResponse(
      res,
      "User verified successfully",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description Login user
 * @route POST /user/login
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Public
 */

type LoginUser = Request<unknown, unknown, RegisterUserRequestBody, unknown>;

type LoginUserResponse = Response<
  | SuccessResponseDataWithToken<IUser>
  | ErrorResponseData
  | SuccessResponseData<IUser>,
  Record<string, unknown>
>;

export const loginUser = tryCatch(
  async (req: LoginUser, res: LoginUserResponse) => {
    // Get user input
    const { email, password } = req.body;

    // validate user inputs
    if (!email || !password) {
      const err: UserError = {
        message: "All fields are required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user is verified
    if (!user.verified) {
      const err: UserError = {
        message: "User is not verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if password match
    const isMatch = await BcryptHelper.comparePassword(password, user.password);
    if (!isMatch) {
      const err: UserError = {
        message: "Invalid credentials",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Generate token
    const token = generateToken(
      { id: user._id },
      process.env["JWT_EXPIRES_IN"] as string
    );

    // Set last login date
    user.last_login = new Date();

    // Save user to database
    await user.save();

    // Return user object with few details
    const userResponse = {
      image: user.image,
      fullname: user.fullname,
      email: user.email,
      gender: user.gender,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      last_login: user.last_login,
      token,
    };

    // Return success response
    return successResponse(
      res,
      "User logged in successfully",
      userResponse as unknown as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description Get user profile
 * @route GET /user/profile
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Private
 */

type RequestObject = Request<
  ParamsDictionary,
  unknown,
  unknown,
  ParsedQs,
  Record<string, unknown>
>;

export const getUserProfile = tryCatch(
  async (req: RequestObject, res: UserResponse) => {
    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId }).select({
      password: 0,
      verificationToken: 0,
      verificationTokenExpire: 0,
      resetPasswordExpire: 0,
      resetPasswordToken: 0,
    });

    // Check if user exist
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Return success response
    return successResponse(
      res,
      "Profile fetched successfully",
      user,
      StatusCodes.OK
    );
  }
);

/**
 * @description generate new verification token
 * @route POST /user/resend-verification-token
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Public
 */

type GenerateVerificationTokenRequest = Request<
  unknown,
  unknown,
  { email: string },
  unknown
>;

export const generateNewVerificationToken = tryCatch(
  async (req: GenerateVerificationTokenRequest, res: UserResponse) => {
    // Get user input
    const { email } = req.body;

    // validate user inputs
    if (!email) {
      const err: UserError = {
        message: "Email is required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user is verified
    if (user.verified) {
      const err: UserError = {
        message: "User is already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

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

    // Set verification token and verification token expire date
    user.verificationToken = verificationToken;
    user.verificationTokenExpire = verificationTokenExpire;

    // Save user to database
    await user.save();

    // create verification url
    const verificationUrl = `${process.env["BASE_URL"]}/user/verify-email/${verificationToken}/${user.email}`;

    // Send verification email
    await emailService.sendEmail(
      user.email,
      "New Verification Token",
      `<h2>Hello, <span style="color: crimson">${
        user.fullname.split(" ")[0]
      }</span></h2>
    <p>A new verification token has been generated for you. Please find the token in the link below. Verification link expires in ${expiration}</p>
    <a href="${verificationUrl}" target="_blank" style="background-color: crimson; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Verify Email</a>`
    );

    // Return success response
    return successResponse(
      res,
      "Verification token generated successfully",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description forgot password
 * @route POST /user/forgot-password
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Public
 */

type ForgotPasswordRequest = Request<
  unknown,
  unknown,
  { email: string },
  unknown
>;

export const forgotPassword = tryCatch(
  async (req: ForgotPasswordRequest, res: UserResponse) => {
    // Get user input
    const { email } = req.body;

    // validate user inputs
    if (!email) {
      const err: UserError = {
        message: "Email is required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Generate verification token
    const resetPasswordToken = generateVerificationToken();

    // Set verification token expire date to 3 hours
    const resetPasswordExpire = new Date();
    resetPasswordExpire.setHours(resetPasswordExpire.getHours() + 3);

    // time verification token expires in hours
    const expiration =
      Math.round(
        (resetPasswordExpire.getTime() - new Date().getTime()) / 3600000
      ) + " hours";

    // Set verification token and verification token expire date
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpire = resetPasswordExpire;

    // Save user to database
    await user.save();

    // create verification url
    const resetPasswordUrl = `${process.env["BASE_URL"]}/user/reset-password/${resetPasswordToken}/${user.email}`;

    // Send verification email
    await emailService.sendEmail(
      user.email,
      "Reset Password",
      `<h2>Hello, <span style="color: crimson">${
        user.fullname.split(" ")[0]
      }</span></h2>
    <p>You requested to reset your password. Please click the link below to reset your password. Reset password link expires in ${expiration}</p>
    <a href="${resetPasswordUrl}" target="_blank" style="background-color: crimson; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Reset Password</a>`
    );

    // Return success response
    return successResponse(
      res,
      "Reset password link has been sent to your email",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description reset password
 * @route POST /user/reset-password/:token/:email
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Public
 */

export const resetPassword = tryCatch(
  async (req: RequestObject, res: UserResponse) => {
    // Get user input
    const { token, email } = req.params;
    const { password, confirmPassword } = req.body as {
      password: string;
      confirmPassword: string;
    };

    // validate user inputs
    if (!token || !email || !password || !confirmPassword) {
      const err: UserError = {
        message: "All fields are required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if user exist
    const user = await User.findOne({ email });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if password match
    if (password !== confirmPassword) {
      const err: UserError = {
        message: "Password does not match",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if reset password token is valid
    if (user.resetPasswordToken !== token) {
      const err: UserError = {
        message: "Invalid reset password token",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if reset password token is expired
    if (user.resetPasswordExpire && user.resetPasswordExpire < new Date()) {
      const err: UserError = {
        message: "Reset password token has expired",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if password is the same as the old password
    const isOldPassword = await BcryptHelper.comparePassword(
      password,
      user.password
    );
    if (isOldPassword) {
      const err: UserError = {
        message: "Password cannot be the same as the old password",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Hash user password
    const hashedPassword = await BcryptHelper.hashPassword(password);

    // Set user password
    user.password = hashedPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpire = null;

    // Save user to database
    await user.save();

    // Return success response
    return successResponse(
      res,
      "Password reset successfully. Login to continue",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description change password
 * @route POST /user/change-password
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Private
 */

type ChangePasswordRequest = Request<
  unknown,
  unknown,
  { oldPassword: string; newPassword: string; confirmPassword: string },
  unknown
>;

export const changePassword = tryCatch(
  async (req: ChangePasswordRequest, res: UserResponse) => {
    // Get user input
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // validate user inputs
    if (!oldPassword || !newPassword || !confirmPassword) {
      const err: UserError = {
        message: "All fields are required",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });

    // Check if user exist
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if password match
    if (newPassword !== confirmPassword) {
      const err: UserError = {
        message: "Password does not match",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if password is the same as the old password
    const isOldPassword = await BcryptHelper.comparePassword(
      newPassword,
      user.password
    );
    if (isOldPassword) {
      const err: UserError = {
        message: "Password cannot be the same as the old password",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Hash user password
    const hashedPassword = await BcryptHelper.hashPassword(newPassword);

    // Set user password
    user.password = hashedPassword;

    // Save user to database
    await user.save();

    // Return success response
    return successResponse(
      res,
      "Password changed successfully",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description update user profile
 * @route PUT /user/profile
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Private
 */

type UpdateUserProfileRequest = Request<unknown, unknown, IUser, unknown>;

export const updateUserProfile = tryCatch(
  async (req: UpdateUserProfileRequest, res: UserResponse) => {
    // possible fields to update
    const allowedFields: string[] = ["image", "fullname", "gender", "phone"];

    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if user is authenticated
    if ((user._id as string).toString() !== (userId._id as string).toString()) {
      const err: UserError = {
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Get fields to update
    const fieldsToUpdate = Object.keys(req.body);

    //  if a user updates the image
    // delete the old image first from cloudinary
    // upload the new image
    // save the new image url to the database
    if (req.files) {
      // delete old image from cloudinary
      const oldImage = user.image as { url: string; filename: string }[];
      const oldImageId = oldImage.map((image) => image.filename);
      await cloudinary.uploader.destroy(oldImageId.join(","));
    }

    user.image = (req.files as Express.Multer.File[]).map(
      (image: Express.Multer.File) => {
        return { url: image.path, filename: image.filename };
      }
    );

    // Check if fields to update is allowed
    const isValidOperation = fieldsToUpdate.every((field) =>
      allowedFields.includes(field)
    );

    // Check if fields to update is valid
    if (!isValidOperation) {
      const err: UserError = {
        message: "Invalid fields to update",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Update user fields
    fieldsToUpdate.forEach((field) => {
      user[field] = req.body[field];
    });

    // Save user to database
    await user.save();

    // Return success response
    return successResponse(
      res,
      "Profile updated successfully",
      user,
      StatusCodes.OK
    );
  }
);

/**
 * @description Add image to user profile
 * @route PUT /user/profile/add-image
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Private
 */

type AddImageToUserProfileRequest = Request<unknown, unknown, unknown, unknown>;

export const addImageToUserProfile = tryCatch(
  async (req: AddImageToUserProfileRequest, res: UserResponse) => {
    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if user is authenticated
    if ((user._id as string).toString() !== (userId._id as string).toString()) {
      const err: UserError = {
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // add image to existing images
    const images = user.image as { url: string; filename: string }[];
    const newImages = (req.files as Express.Multer.File[]).map(
      (image: Express.Multer.File) => {
        return { url: image.path, filename: image.filename };
      }
    );
    const updatedImages = [...images, ...newImages];

    // save new images to database
    user.image = updatedImages;

    // Save user to database
    await user.save();

    // Return success response
    return successResponse(
      res,
      "Image added successfully",
      user,
      StatusCodes.OK
    );
  }
);

/**
 * @description Delete user profile from database
 * @route DELETE /user/profile
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Private
 */

type DeleteUserProfileRequest = Request<unknown, unknown, unknown, unknown>;

export const deleteUserProfile = tryCatch(
  async (req: DeleteUserProfileRequest, res: UserResponse) => {
    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if user is authenticated
    if ((user._id as string).toString() !== (userId._id as string).toString()) {
      const err: UserError = {
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // delete user image from cloudinary
    const images = user.image as { url: string; filename: string }[];
    const imagesId = images.map((image) => image.filename);
    await cloudinary.uploader.destroy(imagesId.join(","));

    // delete user profile from database
    await user.deleteOne();

    // Return success response
    return successResponse(
      res,
      "Profile deleted successfully",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description Get all users
 * @route GET /user/all
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} users
 * @access Private
 */

interface CustomRequest extends Request {
  query: {
    page?: string;
    limit?: string;
  };
}

type PartialUser = Partial<IUser>;

interface PaginatedUsers {
  total: number;
  limit: number;
  page: number;
  pages: number;
  docs: PartialUser[];
}

export const getAllUsers = tryCatch(
  async (req: CustomRequest, res: UserResponse) => {
    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if user is an admin
    if (user.role !== "admin") {
      const err: UserError = {
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Get query params
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // Get total documents
    const total = await User.countDocuments();

    // Get total pages
    const pages = Math.ceil(total / limit);

    // Get offset
    const offset = limit * (page - 1);

    // Get paginated users
    const users: PaginatedUsers = {
      total,
      limit,
      page,
      pages,
      docs: await User.find().skip(offset).limit(limit),
    };

    // Return success response
    return successResponse(
      res,
      "Users fetched successfully",
      users as unknown as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description Get user by id (Single user)
 * @route GET /user/:id
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Private
 */

type GetSingleUser = Request<unknown, unknown, unknown, unknown>;

export const getSingleUser = tryCatch(
  async (req: GetSingleUser, res: UserResponse) => {
    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Get user id from request params
    const { id } = req.params as { id: string };

    // Find user by id
    const singleUser = await User.findOne({ _id: id }).select({
      password: 0,
      verificationToken: 0,
      verificationTokenExpire: 0,
      resetPasswordExpire: 0,
      resetPasswordToken: 0,
    });
    if (!singleUser) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Return success response
    return successResponse(
      res,
      "User fetched successfully",
      singleUser,
      StatusCodes.OK
    );
  }
);
