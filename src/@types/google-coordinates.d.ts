import { Document } from "mongoose";
import { Response } from "express";

declare type ResponseData<T> = Response<T>;

declare interface IGoogleCoordinates extends Document {
  lat: number;
  long: number;
  [key: string]: unknown;
}

declare interface RegisterGoogleCoordinatesRequestBody {
  lat: number;
  long: number;
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

// declare type GoogleCoordinatesResponse = {
//   results: {
//     geometry: {
//       location: {
//         lat: number;
//         lng: number;
//       };
//     };
//   }[];
// };

declare type GoogleCoordinatesResponse = Response<
  SuccessResponseData<IGoogleCoordinates> | ErrorResponseData
>;

declare interface GoogleCoordinatesError {
  error_message: string;
  status: string;
}

declare interface GoogleCoordinatesObject {
  lat: number;
  lng: number;
}
