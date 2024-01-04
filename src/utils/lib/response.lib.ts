import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { Response } from "express";

interface ResponseData<T> {
  success: boolean;
  message?: string;
  payload?: T;
  error?: string;
}

export const successResponse = <T>(
  res: Response,
  message = "",
  data: T,
  code = StatusCodes.OK
) => {
  const responseData: ResponseData<T> = {
    success: true,
    message,
    payload: data,
  };
  return res.status(code).json(responseData);
};

export const errorResponse = (
  res: Response,
  message = "",
  code = StatusCodes.INTERNAL_SERVER_ERROR
) => {
  const responseData: ResponseData<null> = {
    success: false,
    message,
    payload: null,
    error: getReasonPhrase(code),
  };
  return res.status(code).json(responseData);
};

// export const successResponse = (res, data, message = '', code = StatusCodes.OK) => {
//   return res.status(code).json({
//     message,
//     data,
//     error: false,
//   });
// };

// export const errorResponse = (res, message = '', code = StatusCodes.INTERNAL_SERVER_ERROR) => {
//   return res.status(code).json({
//     message,
//     error: true,
//   });
// };
