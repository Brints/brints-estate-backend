import { Schema, model } from "mongoose";
import { IFolder } from "../@types/folders";

const folderSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Folder = model<IFolder>("Folder", folderSchema);
