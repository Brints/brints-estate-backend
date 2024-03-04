import { body, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../../utils/lib/response.lib";

const errorFormatter = ({ msg }: { msg: string }) => {
  return `${msg}`;
};

type ValidateUserRegistrationResponse = Response<
  unknown,
  Record<string, unknown>
>;

// validate user input for user registration
export const validateUserRegistration = [
  body("fullname")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Fullname is required.")
    .isString()
    .withMessage("Fullname should be a string")
    .isLength({ max: 80 })
    .withMessage("Fullname should not be more than 80 characters")
    .trim(),
  body("email")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Email address is required.")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .normalizeEmail()
    .toLowerCase()
    .trim(),
  body("password")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Password is required.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol"
    )
    .trim(),
  body("confirmPassword")
    .exists()
    .withMessage("Confirm password is required field")
    .notEmpty()
    .withMessage("Confirm password is required.")
    .trim(),
  body("gender")
    .exists()
    .withMessage("Required Field")
    .notEmpty()
    .withMessage("Gender is required.")
    .isString()
    .withMessage("Gender should be a string")
    .toLowerCase()
    .trim(),
  body("phone")
    .exists()
    .withMessage("Required Field")
    .notEmpty()
    .withMessage("Phone number is required.")
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

// validate user input for verify email
export const validateVerifyEmail = [
  query("token")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Provide a valid token.")
    .trim(),
  query("email")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Provide a valid email address.")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .normalizeEmail()
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
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Provide a valid email address.")
    .isEmail()
    .withMessage("Invalid email address")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),
  body("password")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Password is required.")
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

// validate user input for forgot password
export const validateForgotPassword = [
  body("email")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Provide a valid email address.")
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
