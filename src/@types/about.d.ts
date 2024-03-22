import { Document } from "mongoose";

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

export interface AboutObject extends Request {
  about: IAbout;
}
