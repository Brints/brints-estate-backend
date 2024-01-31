import { Document } from "mongoose";
import { Response } from "express";
// import { ParsedQs } from "qs";
// import { ParamsDictionary } from "express-serve-static-core";

declare type ResponseData<T> = Response<T>;

declare interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  discount?: number;
  location: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipcode?: string;
  status: string;
  type: string;
  bedroom: number;
  bathroom: number;
  amenities: string[];
  images: { url: string; filename: string }[];
  [key: string]: unknown;
}

declare interface RegisterListingRequestBody {
  title: string;
  description: string;
  price: number;
  discount?: number;
  address: string;
  city: string;
  state: string;
  country: string;
  status: string;
  type: string;
  bedroom: number;
  bathroom: number;
  amenities: string;
  images: { url: string; filename: string }[];
}

declare interface SuccessResponseData<T> {
  message: string;
  data: T;
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

declare type ListingResponse = Response<
  SuccessResponseData<IListing> | ErrorResponseData
>;

declare interface ListingError {
  message: string;
  statusCode: number;
}

declare interface ListingObject extends Request {
  listing: IListing;
}

// declare type RequestObject = Request<
//   ParamsDictionary,
//   unknown,
//   unknown,
//   ParsedQs,
//   Record<string, unknown>
// >;
