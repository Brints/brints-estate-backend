import { Schema, model } from "mongoose";
import { IListing } from "../@types/listing";

// Listing schema
const listingSchema: Schema = new Schema(
  {
    images: [{ url: String, filename: String }],
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    location: { type: Schema.Types.ObjectId, ref: "Location" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
    coordinates: { type: Schema.Types.ObjectId, ref: "GoogleCoordinates" },
    status: {
      type: String,
      enum: ["rent", "sale", "taken"],
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
  },
  { timestamps: true }
);

// Listing model
export const Listing = model<IListing>("Listing", listingSchema);
