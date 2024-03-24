import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface IFavorite extends Document {
  listing: string;
  user: string;
  [key: string]: unknown;
}

declare interface FavoriteRequestBody {
  listing: string;
  user: string;
  [key: string]: unknown;
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

declare type FavoriteResponse = Response<
  SuccessResponseData<IFavorite> | ErrorResponseData
>;

declare interface FavoriteError {
  message: string;
  statusCode: number;
}

declare interface FavoriteObject extends Request {
  favorite: IFavorite;
}
