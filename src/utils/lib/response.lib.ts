import { Response } from "express";
import { StatusCodes, getReasonPhrase } from "http-status-codes";

// Define a type for the data in the success response
export interface SuccessResponseData<T> {
  message: string;
  data: T;
  statusCode: number;
}

// Define a type for the data in the error response
export interface ErrorResponseData {
  success: boolean;
  error: {
    type: string;
    statusCode: number;
    message: string;
  };
}

// Helper function for success Response
export const successResponse = <T>(
  res: Response<SuccessResponseData<T>>,
  message: string,
  data: T,
  statusCode: number = StatusCodes.OK
): Response<SuccessResponseData<T>> => {
  const successData: SuccessResponseData<T> = {
    message,
    data,
    statusCode,
  };
  return res.status(statusCode).json(successData);
};

// Helper function for error Response
export const errorResponse = (
  res: Response<ErrorResponseData>,
  message: string,
  statusCode: number = StatusCodes.BAD_REQUEST
): Response<ErrorResponseData> => {
  const errorData: ErrorResponseData = {
    success: false,
    error: {
      type: getReasonPhrase(statusCode),
      statusCode,
      message,
    },
  };
  return res.status(statusCode).json(errorData);
};
