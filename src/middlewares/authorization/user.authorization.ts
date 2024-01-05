import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { errorResponse, ErrorResponseData } from "../../utils/lib/response.lib";
import { verifyToken } from "../../utils/helpers/jwt.helper";
import { User, IUser } from "../../models/user.model";

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
      return errorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return errorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
    }

    const payload = verifyToken(token);
    if (!payload) {
      return errorResponse(
        res,
        "Invalid Token. Please login again",
        StatusCodes.FORBIDDEN
      );
    }

    const user = await User.findOne({ token });

    // get user from database and attach to request object
    req.user = user as IUser;
    next();
    return;
  } catch (error) {
    console.error(error);
    return errorResponse(res, "Unauthorized", StatusCodes.UNAUTHORIZED);
  }
};
