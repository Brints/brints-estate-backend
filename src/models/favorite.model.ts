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
  },
  { timestamps: true }
);

export const Favorite = model<IFavorite>("Favorite", favoriteSchema);
