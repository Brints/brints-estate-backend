import { Response } from "express";

declare type ResponseData<T> = Response<T>;

export interface ResponseError {
  message: string;
  statusCode: number;
}

export interface SuccessResponseData<T> {
  message: string;
  data: T;
  statusCode: number;
}

export interface ErrorResponseData {
  success: boolean;
  error: {
    type: string;
    message: string;
    statusCode: number;
  };
}

export type ResponseObject<T> = Response<
  SuccessResponseData<T> | ErrorResponseData
>;
