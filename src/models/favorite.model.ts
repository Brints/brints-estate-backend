import { Schema, model } from "mongoose";
import { IFavorite } from "../@types/favorite";

const favoriteSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    folder: {
      type: Schema.Types.ObjectId,
      ref: "Folder",
    },
  },
  { timestamps: true }
);

export const ListingFavorite = model<IFavorite>(
  "ListingFavorite",
  favoriteSchema
);
