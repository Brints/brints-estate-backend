import { body, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../../utils/lib/response.lib";

const errorFormatter = ({ msg }: { msg: string }) => {
  return `${msg}`;
};

type ValidateUserRegistrationResponse = Response<unknown>;

// validate user input for user registration
export const validateUserRegistration = [
  body("fullname")
    .exists()
    .withMessage("Fullname is required")
    .isString()
    .withMessage("Fullname should be a string")
    .trim(),
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),
  body("password")
    .exists()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol"
    )
    .trim(),
  body("confirmPassword")
    .exists()
    .withMessage("Confirm password is required")
    .trim(),
  body("gender")
    .exists()
    .withMessage("Choose your gender")
    .toLowerCase()
    .trim(),
  body("phone").exists().withMessage("Phone number is required").trim(),

  (req: Request, res: ValidateUserRegistrationResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const err = {
        message: errors.array().join(", "),
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }
    return next();
  },
];

// validate user input for verify email
export const validateVerifyEmail = [
  body("token").exists().withMessage("Token is required").trim(),
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),

  (req: Request, res: ValidateUserRegistrationResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const err = {
        message: errors.array().join(", "),
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }
    return next();
  },
];

// validate user input for login
export const validateLogin = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),
  body("password").exists().withMessage("Password is required").trim(),

  (req: Request, res: ValidateUserRegistrationResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const err = {
        message: errors.array().join(", "),
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }
    return next();
  },
];

// validate user input for forgot password
export const validateForgotPassword = [
  body("email")
    .exists()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),

  (req: Request, res: ValidateUserRegistrationResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);
    if (!errors.isEmpty()) {
      const err = {
        message: errors.array().join(", "),
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }
    return next();
  },
];
