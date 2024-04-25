import { Schema, model } from "mongoose";
import { IDiscount } from "../@types/discount";

const discountSchema: Schema = new Schema(
  {
    discount: { type: Number, required: true },
    oldPrice: { type: Number, required: true },
    newPrice: { type: Number, required: true },
    expireAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const discountModel = model<IDiscount>("Discount", discountSchema);
