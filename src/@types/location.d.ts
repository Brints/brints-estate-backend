import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface ILocation extends Document {
  name?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode?: string;
  [key: string]: unknown;
}

declare type LocationResponse = ResponseData<ILocation>;
declare type LocationError = ResponseData<Error>;

export { ILocation, LocationResponse, LocationError };
