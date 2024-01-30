import { Schema, model } from "mongoose";
import { IListing } from "../@types/listing";

// Listing schema
const listingSchema: Schema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["rent", "sale"],
      default: "rent",
    },
    type: {
      type: String,
      enum: ["apartment", "house", "office", "store"],
      required: true,
      default: "apartment",
    },
    bedroom: { type: Number, required: true },
    bathroom: { type: Number, required: true },
    amenities: { type: Array, required: true },
    images: [{ url: String, filename: String }],
    owner: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Listing model
export const Listing = model<IListing>("Listing", listingSchema);
