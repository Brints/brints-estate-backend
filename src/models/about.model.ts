import { model, Schema } from "mongoose";
import { IAbout } from "../@types/about";

const aboutSchema = new Schema<IAbout>(
  {
    image: [{ url: String, filename: String }],
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<IAbout>("About", aboutSchema);
