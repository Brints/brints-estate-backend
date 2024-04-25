import { Schema, model } from "mongoose";
import { IGoogleCoordinates } from "../@types/google-coordinates";

// GoogleCoordinates schema
const googleCoordinatesSchema: Schema = new Schema(
  {
    lat: { type: Number, required: true },
    long: { type: Number, required: true },
  },
  { timestamps: true }
);

// GoogleCoordinates model
export const GoogleCoordinates = model<IGoogleCoordinates>(
  "GoogleCoordinates",
  googleCoordinatesSchema
);
