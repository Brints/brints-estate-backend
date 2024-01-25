import { Document } from "mongoose";
import { Response } from "express";

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
