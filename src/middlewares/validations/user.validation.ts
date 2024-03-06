import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../../utils/lib/response.lib";

const errorFormatter = ({ msg }: { msg: string }) => {
  return `${msg}`;
};

/**
 * @description Validation for registration of new user
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

type ValidateUserResponse = Response<unknown, Record<string, unknown>>;

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

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
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

/**
 * @description Validation to verify email address of new user
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

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

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
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

/**
 * @description Validation to login users
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

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

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
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

/**
 * @description Validation for forgot password
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

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

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
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

/**
 * @description Validation to resend verification token
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

export const validateResendVerificationToken = [
  body("email")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Email address cannot be empty.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
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

/**
 * @description Validation to reset password
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

export const validateResetPassword = [
  param("email")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Email address cannot be empty.")
    .isEmail()
    .withMessage("Please provide a valid email address.")
    .isString()
    .withMessage("Email should be a string")
    .toLowerCase()
    .trim(),
  param("token")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Token cannot be empty.")
    .trim(),
  body("newPassword")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Password cannot be empty.")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol"
    )
    .trim(),
  body("confirmPassword")
    .exists()
    .withMessage("Required Field.")
    .notEmpty()
    .withMessage("Confirm password cannot be empty.")
    .trim(),

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
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

/**
 * @description Validation to change password
 * @param {string} req
 * @param {string} res
 * @param {string} next
 * @returns {object} error
 */

export const validateChangePassword = [
  body("oldPassword")
    .exists()
    .withMessage("Old Password Field is required.")
    .notEmpty()
    .withMessage("Old Password cannot be empty.")
    .isString()
    .withMessage("Old Password must be a string.")
    .trim(),
  body("newPassword")
    .exists()
    .withMessage("New Password Field is required.")
    .notEmpty()
    .withMessage("Please provide your new password")
    .isLength({ min: 8, max: 16 })
    .withMessage(
      "Password should not be less than 8 characters and not more than 16 characters."
    )
    .isStrongPassword()
    .withMessage(
      "Password must contain at least 1 lowercase, 1 uppercase, 1 number and 1 symbol"
    )
    .trim(),
  body("confirmPassword")
    .exists()
    .withMessage("Confirm Password Field is required.")
    .notEmpty()
    .withMessage("Confirm Password cannot be empty.")
    .equals("newPassword")
    .withMessage("Password does not match.")
    .trim(),

  (req: Request, res: ValidateUserResponse, next: NextFunction) => {
    const errors = validationResult(req).formatWith(errorFormatter);

    if (!errors.isEmpty()) {
      const err = {
        message: errors.array().join(" ,"),
        statusCode: StatusCodes.BAD_REQUEST,
      };
      return errorResponse(res, err.message, err.statusCode);
    }
    return next();
  },
];
