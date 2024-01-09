import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { errorResponse } from "../../utils/lib/response.lib";
import { verifyToken } from "../../utils/helpers/jwt.helper";
import { User } from "../../models/user.model";

// import interfaces
import { ErrorResponseData, IUser } from "../../@types";

interface AuthenticatedUserError {
  message: string;
  statusCode: number;
}

interface AuthenticatedUserRequest extends Request {
  user?: Record<string, unknown>;
}

type AuthenticatedUserResponse = Response<ErrorResponseData>;

export const authenticatedUser = async (
  req: AuthenticatedUserRequest,
  res: AuthenticatedUserResponse,
  next: NextFunction
): Promise<AuthenticatedUserResponse | void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const err: AuthenticatedUserError = {
        message: "Unauthorized",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      const err: AuthenticatedUserError = {
        message: "Unauthorized",
        statusCode: StatusCodes.UNAUTHORIZED,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const payload = verifyToken(token);
    if (!payload) {
      const err: AuthenticatedUserError = {
        message: "Please login again.",
        statusCode: StatusCodes.FORBIDDEN,
      };
      return errorResponse(res, err.message, err.statusCode);
    }

    const user = await User.findOne({ _id: payload["id"] });

    console.log(user);

    // get user from database and attach to request object
    req.user = user as IUser;
    next();
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
  }
};
