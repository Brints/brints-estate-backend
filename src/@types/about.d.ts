import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

export interface IAbout extends Document {
  title: string;
  description: string;
  image: string[];
}

export interface IAboutResponse {
  status: string;
  message: string;
  data: IAbout;
}

export interface IAboutResponseError {
  status: string;
  message: string;
}
