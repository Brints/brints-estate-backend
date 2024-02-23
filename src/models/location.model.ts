import { Schema, model } from "mongoose";
import { ILocation } from "../@types/location";

// Location schema
const locationSchema: Schema = new Schema(
  {
    name: { type: String, trim: true },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    zipcode: { type: String, trim: true },
  },
  { timestamps: true }
);

// Location model
export const Location = model<ILocation>("Location", locationSchema);
