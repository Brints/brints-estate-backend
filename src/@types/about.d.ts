import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

export interface IAbout extends Document {
  title: string;
  content: string;
  image: string[];
}

export interface AboutResponse {
  message: string;
  data: IAbout;
  statusCode: number;
}

export interface AboutResponseError {
  message: string;
  statusCode: number;
}

export interface AboutObject extends Request {
  about: IAbout;
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
