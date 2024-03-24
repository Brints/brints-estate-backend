import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface IDiscount extends Document {
  code: string;
  discount: number;
  expireAt: Date;
}

declare interface DiscountResponse {
  message: string;
  payload: IDiscount;
  statusCode: number;
}

declare interface DiscountError {
  message: string;
  statusCode: number;
}

declare interface DiscountObject extends Request {
  discount: IDiscount;
}

declare interface SuccessResponseData<T> {
  message: string;
  payload: T;
  statusCode: number;
}

declare interface ErrorResponseData {
  success: boolean;
  error: {
    type: string;
    message: string;
    statusCode: number;
  };
}

export {
  ResponseData,
  IDiscount,
  DiscountResponse,
  DiscountError,
  DiscountObject,
  SuccessResponseData,
  ErrorResponseData,
};
