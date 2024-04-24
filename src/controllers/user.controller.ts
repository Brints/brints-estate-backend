// import libraries
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ParsedQs } from "qs";
import { ParamsDictionary } from "express-serve-static-core";

// import custom libraries
import tryCatch from "../utils/lib/try-catch.lib";
import { successResponse, errorResponse } from "../utils/lib/response.lib";
import { User } from "../models/user.model";
import { UserAuthModel } from "../models/userAuth.model";
import BcryptHelper from "../utils/helpers/bcrypt.helper";
import {
  generateVerificationToken,
  generateOTP,
} from "../utils/lib/verification-token.lib";
import { emailService } from "../services/email.service";
import {
  registerEmailTemplate,
  verifyEmailTemplate,
  generateNewVerificationTokenTemplate,
} from "../services/email-templates.service";
import { UserHelper } from "../utils/helpers/user.helper";
import { cloudinary } from "../config/multer.config";
import { generateToken } from "../utils/helpers/jwt.helper";

// import interfaces
import { IUser, UserResponse, UserAuth } from "../@types";
import { RegisterUserRequestBody, UserError } from "../@types";
import { SuccessResponseData, ErrorResponseData } from "../@types";
import { verifyEmailParams, verifyPhoneParams } from "../@types";
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
    const {
      avatar,
      fullname,
      email,
      phone,
      gender,
      password,
      confirmPassword,
      code,
    } = req.body;

    // Handle gender ValidationError
    if (gender.toLowerCase() !== "male" && gender.toLowerCase() !== "female") {
      const err: UserError = {
        message: `${gender} is not a valid gender enum value`,
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (!code.slice(0, 1).startsWith("+")) {
      const err: UserError = {
        message: "Zip Code is not valid.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const fullPhone = `${code}${phone}`;

    // Check if user already exist
    const user = await User.findOne({ email });

    if (user) {
      const err: UserError = {
        message: "User already exist",
        statusCode: StatusCodes.CONFLICT,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if phone number already exist
    const phoneNumber = await User.findOne({ phone: fullPhone });
    if (phoneNumber) {
      const err: UserError = {
        message: "Phone number already exist",
        statusCode: StatusCodes.CONFLICT,
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

    // check if password is the same as email
    if (password === email) {
      const err: UserError = {
        message: "Password cannot be the same as email",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if password includes any part of the fullname
    const fullnameArray = fullname.split(" ");
    if (fullnameArray.some((name) => password.includes(name))) {
      const err: UserError = {
        message: "Password cannot include your name",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // check if password is the same as fullname
    if (password === fullname) {
      const err: UserError = {
        message: "Password cannot be the same as your name",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Capitalize first letter of fullname
    const capitalizedFullname = UserHelper.capitalizeFirstLetter(fullname);

    // Hash user password
    const hashedPassword = await BcryptHelper.hashPassword(password);

    // Make user an admin if it is the first user
    const users = await User.find();
    const role = users.length === 0 ? "admin" : "user";

    // Generate verification token
    const verificationToken = generateVerificationToken();

    // Generate OTP to verify phone number
    const otp = generateOTP(6);

    // Set verification token expire date to 3 hours
    // const verificationTokenExpire = new Date();
    // verificationTokenExpire.setHours(verificationTokenExpire.getHours() + 3);

    // Set verification token expire date to 15 minutes
    const verificationTokenExpire = new Date();
    verificationTokenExpire.setMinutes(
      verificationTokenExpire.getMinutes() + 15
    );

    // Set otp expire date to 15 minutes
    const otpExpire = new Date();
    otpExpire.setMinutes(otpExpire.getMinutes() + 15);

    // const resetPasswordExpire = null;
    const resetPasswordToken = "";

    const defaultAvatar: { url: string; filename: string }[] = [];

    // set default avatar based on gender
    if (!avatar && gender === "female") {
      defaultAvatar.push({
        url: "https://e7.pngegg.com/pngimages/961/57/png-clipart-computer-icons-icon-design-apple-icon-format-female-avatar-desktop-wallpaper-silhouette-thumbnail.png",
        filename: "female avatar",
      });
    }

    if (!avatar && gender === "male") {
      defaultAvatar.push({
        url: "https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png",
        filename: "male avatar",
      });
    }

    const verified = false;

    const newUser: IUser = new User({
      avatar: avatar !== undefined && avatar ? avatar : defaultAvatar,
      fullname: capitalizedFullname,
      email,
      password: hashedPassword,
      phone: fullPhone,
      role,
      gender,
      last_login: null,
      verified,
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
      newUser.avatar = imagesUrl;
    }

    // Save user to database
    await newUser.save();

    // Create user auth
    const userAuth: UserAuth = new UserAuthModel({
      otp,
      otpExpiration: otpExpire,
      verificationToken,
      resetPasswordToken,
      tokenExpiration: verificationTokenExpire,
      emailVerified: false,
      phoneNumberVerified: false,
      status: "pending",
      userId: newUser._id as string,
    });

    // Save user auth to database
    await userAuth.save();

    // Send OTP to user phone number

    // Send verification email
    await registerEmailTemplate(newUser, userAuth);

    // Return user object with few details
    const userResponse = {
      avatar: newUser.avatar,
      fullname: newUser.fullname,
      email: newUser.email,
      gender: newUser.gender,
      phone: newUser.phone,
      role: newUser.role,
      last_login: newUser.last_login,
      verified: newUser.verified,
    };

    // Return success response
    return successResponse(
      res,
      "Success! Please check your email to verify your account.",
      userResponse as IUser,
      StatusCodes.CREATED
    );
  }
);

/**
 * @description Google sign up
 * @route POST /user/google-signup
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user
 * @access Public
 */

type GoogleSignUp = Request<unknown, unknown, unknown, unknown>;

export const googleSignUp = tryCatch(
  async (req: GoogleSignUp, res: UserResponse) => {
    const { email } = req.body as { email: string };

    // check if the user exists, login the user
    const user = await User.findOne({ email });

    if (user) {
      // generate the token
      const token = generateToken(
        { id: user._id },
        process.env["JWT_EXPIRES_IN"] as string
      );

      if (user.avatar && user.avatar.length === 0 && user.gender === "female") {
        user.avatar.push({
          url: "https://e7.pngegg.com/pngimages/961/57/png-clipart-computer-icons-icon-design-apple-icon-format-female-avatar-desktop-wallpaper-silhouette-thumbnail.png",
          filename: "female avatar",
        });
      } else if (
        user.avatar &&
        user.avatar.length === 0 &&
        user.gender === "male"
      ) {
        user.avatar.push({
          url: "https://w7.pngwing.com/pngs/831/88/png-transparent-user-profile-computer-icons-user-interface-mystique-miscellaneous-user-interface-design-smile-thumbnail.png",
          filename: "male avatar",
        });
      }

      // set last login date
      user.last_login = new Date();

      // format fullname
      user.fullname = UserHelper.capitalizeFirstLetter(user.fullname);

      // save user to database
      await user.save();

      // return user object with few details
      const userResponse = {
        avatar: user.avatar,
        fullname: user.fullname,
        email: user.email,
        gender: user.gender,
        phone: user.phone,
        role: user.role,
        verified: user.verified,
        last_login: user.last_login,
        token,
      };

      // return success response
      return successResponse(
        res,
        "User logged in successfully",
        userResponse as unknown as IUser,
        StatusCodes.OK
      );
    } else {
      const { avatar, fullname, email } = req.body as {
        avatar: string;
        fullname: string;
        email: string;
      };

      // generate random strong password
      const randomPassword = Math.random().toString(36).slice(-10);

      // hash user password
      const hashedPassword = await BcryptHelper.hashPassword(randomPassword);

      // format fullname
      UserHelper.capitalizeFirstLetter(fullname);

      // make user an admin if it is the first user
      const users = await User.find();
      const role = users.length === 0 ? "admin" : "user";

      const defaultAvatar: { url: string; filename: string }[] = [];
      defaultAvatar.push({
        url: avatar,
        filename: "google avatar",
      });

      // set default gender
      const gender = "male";

      // set default phone number
      const phone = "00000000000";

      // set verified to true
      const verified = true;

      // create new user
      const newUser: IUser = new User({
        avatar: defaultAvatar,
        fullname,
        email,
        password: hashedPassword,
        role,
        gender,
        phone,
        verified,
      });

      // save user to database
      await newUser.save();

      // send welcome email
      // await registerEmailTemplate(newUser);

      // return success response
      return successResponse(
        res,
        "Success! Please check your email to verify your account.",
        {} as IUser,
        StatusCodes.CREATED
      );
    }
  }
);

/**
 * @description Verify user email
 * @route POST /user/verify-email/?token=token&email=email
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
    const { token, email }: verifyEmailParams = req.query as verifyEmailParams;

    // Find user by email
    const user = (await User.findOne({ email })) as IUser;

    const userAuth = (await UserAuthModel.findOne({
      userId: user._id as string,
    })) as UserAuth;

    // Check if user exist
    if (!user) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (userAuth.status === "verified") {
      const err: UserError = {
        message: "User is already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (userAuth.verificationToken !== token) {
      const err: UserError = {
        message: "Invalid verification token",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (userAuth.tokenExpiration && userAuth.tokenExpiration < new Date()) {
      userAuth.status = "expired";
    }

    if (userAuth.status === "expired") {
      const err: UserError = {
        message: "Verification token has expired.",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // if (userAuth.tokenExpiration && userAuth.tokenExpiration < new Date()) {
    //   const err: UserError = {
    //     message: "Verification token has expired.",
    //     statusCode: StatusCodes.BAD_REQUEST,
    //   };
    //   return errorResponse(res, err.message, err.statusCode);
    // }

    userAuth.emailVerified = true;
    userAuth.verificationToken = "";
    userAuth.tokenExpiration = null;

    if (
      userAuth.emailVerified === true &&
      userAuth.phoneNumberVerified === true
    ) {
      userAuth.status = "verified";
    }

    await userAuth.save();

    user.verified = userAuth.status === "verified" ? true : false;

    // Save user to database
    await user.save();

    // TODO: Send welcome email
    await verifyEmailTemplate(user);

    // Return success response
    return successResponse(
      res,
      "Success! Your email has been verified. Please login with your email & password.",
      {} as IUser,
      StatusCodes.OK
    );
  }
);

/**
 * @description Verify user phone number
 * @route POST /user/verify-phone/:phone
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 */

type VerifyPhone = Request<unknown, unknown, verifyPhoneParams, unknown>;

export const verifyPhoneNumber = tryCatch(
  async (req: VerifyPhone, res: UserResponse) => {
    const { otp } = req.body;
    const { phone } = req.params as { phone: string };

    if (phone.slice(0, 1) !== "+") {
      const err: UserError = {
        message: "Invalid phone number. Phone number must include country code",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const user = (await User.findOne({ phone })) as IUser;

    const userAuth = (await UserAuthModel.findOne({
      userId: user._id as string,
    })) as UserAuth;

    if (user.verified && userAuth.phoneNumberVerified) {
      const err: UserError = {
        message: "User and Phone number already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (userAuth.otp !== otp) {
      const err: UserError = {
        message: "Invalid OTP",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (userAuth.otpExpiration && userAuth.otpExpiration < new Date()) {
      userAuth.status = "expired";
    }

    if (userAuth.status === "expired") {
      const err: UserError = {
        message: "OTP has expired",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // if (userAuth.otpExpiration && userAuth.otpExpiration < new Date()) {
    //   const err: UserError = {
    //     message: "OTP has expired",
    //     statusCode: StatusCodes.BAD_REQUEST,
    //   };
    //   return errorResponse(res, err.message, err.statusCode);
    // }

    userAuth.phoneNumberVerified = true;
    userAuth.otp = "";
    userAuth.otpExpiration = null;

    if (
      userAuth.emailVerified === true &&
      userAuth.phoneNumberVerified === true
    ) {
      userAuth.status = "verified";
    }

    await userAuth.save();

    user.verified = userAuth.status === "verified" ? true : false;

    await user.save();

    // Return success response
    return successResponse(
      res,
      "Phone number verified successfully",
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
    const isMatch = await BcryptHelper.comparePassword(password, user.password);
    if (!isMatch) {
      const err: UserError = {
        message: "Invalid credentials",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    if (!user.verified) {
      const err: UserError = {
        message:
          "Your account has not been verified. Please check your email to verify your account.",
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

    // Remove password from the user object
    const userObj = UserHelper.removeItemsFromUserObject(user);
    if (userObj) {
      userObj.token = token;
    }

    // Return success response
    return successResponse(
      res,
      "User logged in successfully",
      userObj as unknown as IUser,
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
      userAuth: 0,
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

    const userAuth = (await UserAuthModel.findOne({
      userId: user._id as string,
    })) as UserAuth;

    // Check if user is verified
    if (userAuth.status === "verified") {
      const err: UserError = {
        message: "User is already verified",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Generate verification token
    const resetPasswordToken = generateVerificationToken();

    // Set verification token expire date to 3 hours
    // const verificationTokenExpire = new Date();
    // verificationTokenExpire.setHours(verificationTokenExpire.getHours() + 3);

    // Set verification token expire date to 15 minutes
    const verificationTokenExpire = new Date();
    verificationTokenExpire.setMinutes(
      verificationTokenExpire.getMinutes() + 15
    );

    // Set verification token and verification token expire date
    // user.verificationToken = verificationToken;
    // user.verificationTokenExpire = verificationTokenExpire;

    userAuth.resetPasswordToken = resetPasswordToken;
    userAuth.tokenExpiration = verificationTokenExpire;

    await userAuth.save();

    // Send verification email
    await generateNewVerificationTokenTemplate(user, userAuth);

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

    const userAuth = (await UserAuthModel.findOne({
      userId: user._id as string,
    })) as UserAuth;

    // Generate verification token
    const resetPasswordToken: string = generateVerificationToken();

    // Set verification token expire date to 15 minutes
    const tokenExpiration = new Date();
    tokenExpiration.setMinutes(tokenExpiration.getMinutes() + 15);

    const expiration =
      Math.round((tokenExpiration.getTime() - new Date().getTime()) / 60000) +
      " minutes";

    // Set verification token and verification token expire date
    userAuth.resetPasswordToken = resetPasswordToken;
    userAuth.tokenExpiration = tokenExpiration;

    // Save user to database
    await user.save();

    // create verification url
    const resetPasswordUrl = `${process.env["BASE_URL"]}/user/reset-password/${userAuth.resetPasswordToken}/${user.email}`;

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
    const { newPassword, confirmPassword } = req.body as {
      newPassword: string;
      confirmPassword: string;
    };

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
    if (newPassword !== confirmPassword) {
      const err: UserError = {
        message: "Password does not match",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const userAuth = (await UserAuthModel.findOne({
      userId: user._id as string,
    })) as UserAuth;

    // Check if reset password token is valid
    if (userAuth.resetPasswordToken !== token) {
      const err: UserError = {
        message: "Invalid reset password token",
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Check if reset password token is expired
    if (userAuth.tokenExpiration && userAuth.tokenExpiration < new Date()) {
      const err: UserError = {
        message: "Reset password token has expired",
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
    userAuth.resetPasswordToken = "";
    userAuth.tokenExpiration = null;

    await userAuth.save();

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

    // check if oldPassword is equal to the password in the database
    const oldPasswordMatch = await BcryptHelper.comparePassword(
      oldPassword,
      user.password
    );
    if (!oldPasswordMatch) {
      const err: UserError = {
        message: "Please provide the correct old password.",
        statusCode: StatusCodes.BAD_REQUEST,
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
    const { avatar, fullname, gender, phone, role } = req.body;

    // capitalize fullname
    // CapitalizeFirstLetter.capitalizeFirstLetter(fullname);

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

    //  if a user updates the image, delete the old image first from cloudinary
    // then upload the new image and save the new image url to the database
    if (req.files) {
      // delete old image from cloudinary
      const oldImage = user.avatar as { url: string; filename: string }[];
      const oldImageId = oldImage.map((image) => image.filename);
      await cloudinary.uploader.destroy(oldImageId.join(","));

      // upload new image to cloudinary
      const images = req.files as Express.Multer.File[];
      const imagesUrl = await Promise.all(
        images.map(async (image) => {
          const result = await cloudinary.uploader.upload(image.path);
          return { url: result.secure_url, filename: result.public_id };
        })
      );
      user.avatar = imagesUrl;

      await user.save();
    }

    // if user attempts to update role to admin, return error
    if (role === "admin") {
      const err: UserError = {
        message: "You cannot make yourself an admin. Contact the admin",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId._id,
      {
        $set: {
          avatar,
          fullname: UserHelper.capitalizeFirstLetter(fullname), // capitalize fullname
          gender,
          phone,
          role,
        },
      },
      { new: true }
    );

    // Return success response
    return successResponse(
      res,
      "Profile updated successfully.",
      updatedUser as IUser,
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
    const images = user.avatar as { url: string; filename: string }[];
    const newImages = (req.files as Express.Multer.File[]).map(
      (image: Express.Multer.File) => {
        return { url: image.path, filename: image.filename };
      }
    );
    const updatedImages = [...images, ...newImages];

    // save new images to database
    user.avatar = updatedImages;

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
    if (
      (user._id as string).toString() !== (userId._id as string).toString() ||
      user.role !== "admin"
    ) {
      const err: UserError = {
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // delete user image from cloudinary
    const images = user.avatar as { url: string; filename: string }[];
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
    const page = Number(req.query.page as string) || 1;
    const limit = Number(req.query.limit as string) || 10;

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

/**
 * @description Admin update the role of another user to admin
 * @route PUT /user/:id/make-admin
 * @param {Request} req
 * @param {Response} res
 * @returns {JSON} message
 * @returns {JSON} user object
 * @access Private
 */

type MakeUserAdmin = Request<unknown, unknown, unknown, unknown>;

export const makeUserAdmin = tryCatch(
  async (req: MakeUserAdmin, res: UserResponse) => {
    // Get user id from request object
    const userId = (req as unknown as UserObject).user;

    // Find user by id
    const user = await User.findOne({ _id: userId });
    if (!user && (user as unknown as IUser).role !== "admin") {
      const err: UserError = {
        message: "You are not authorized to perform this action",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // Get user id from request params
    const { id } = req.params as { id: string };

    // Find user by id
    const singleUser = await User.findOne({ _id: id });
    if (!singleUser) {
      const err: UserError = {
        message: "User does not exist",
        statusCode: StatusCodes.NOT_FOUND,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    // update user role
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          role: "admin",
        },
      },
      { new: true }
    );

    // Return success response
    return successResponse(
      res,
      "User role updated successfully",
      updatedUser as IUser,
      StatusCodes.OK
    );
  }
);
