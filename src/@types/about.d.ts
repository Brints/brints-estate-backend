import { Document } from "mongoose";

export interface IAbout extends Document {
  title: string;
  content: string;
  image: { url: string; filename: string }[];
  [key: string]: unknown;
}

export interface AboutRequestBody {
  title: string;
  content: string;
  image: { url: string; filename: string }[];
  [key: string]: unknown;
}

export interface AboutObject extends Request {
  about: IAbout;
}
