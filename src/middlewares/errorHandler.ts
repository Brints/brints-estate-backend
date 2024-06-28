import { TokenExpiredError } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

// jwt error handler
export default function errorHandler(
  err: TokenExpiredError,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "🚫 Unauthorized Access. Token has expired. Please login again.",
      expiredAt: err.expiredAt,
    });
  }
  return next(err);
}

// multer error handler
export function multerErrorHandler(
  err: MulterError,
  _req: Request,
  res: Response,
  next: NextFunction
) {
  if (err instanceof MulterError) {
    const error = {
      message: err.message,
      stack: err.stack,
      name: err.name,
    };
    return res.status(400).json({
      success: false,
      error,
    });
  }
  return next(err);
}
