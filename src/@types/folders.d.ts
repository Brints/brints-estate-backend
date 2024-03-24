import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface IFolder extends Document {
  name: string;
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

declare type FolderResponse = Response<
  SuccessResponseData<IFolder> | ErrorResponseData
>;

declare interface FolderError {
  message: string;
  statusCode: number;
}

declare interface FolderRequestBody {
  name: string;
  user: string;
  [key: string]: unknown;
}

declare interface FolderUpdateRequestBody {
  name: string;
  [key: string]: unknown;
}

declare type FolderResponseData = ResponseData<FolderResponse>;

declare type FolderErrorData = ResponseData<FolderError>;

// declare type FolderRequest = Request<unknown, unknown, FolderRequestBody, unknown>;
