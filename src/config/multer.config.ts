import * as multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinaryConfig from "./cloudinary.config";
import { CustomParams } from "../@types";
import * as dotenv from "dotenv";
dotenv.config();

const cloudinaryConfigOptions = cloudinaryConfig(
  process.env["CLOUDINARY_CLOUD_NAME"] as string,
  process.env["CLOUDINARY_API_KEY"] as string,
  process.env["CLOUDINARY_API_SECRET"] as string
);

cloudinary.config(cloudinaryConfigOptions);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "brints-estate",
    allowedFormats: ["jpg", "png", "jpeg"],
  } as CustomParams,
});

const MAX_FILE_SIZE = 1024 * 1024 * 5; // 5MB

export const multerConfig = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      return callback(null, false);
    }
    callback(null, true);
  },
});

export { cloudinary };
