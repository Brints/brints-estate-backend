import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface ILocation extends Document {
  name?: string;
  address: string;
  town: string;
  province: string;
  country: string;
  postalCode?: string;
  [key: string]: unknown;
}

declare type LocationResponse = ResponseData<ILocation>;
declare type LocationError = ResponseData<Error>;

export { ILocation, LocationResponse, LocationError };
