import { Schema, model } from "mongoose";
import { ILocation } from "../@types/location";

// Location schema
const locationSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    town: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true },
  },
  { timestamps: true }
);

// Location model
export const Location = model<ILocation>("Location", locationSchema);
