import multer from "multer";
import {CloudinaryStorage} from "multer-storage-cloudinary";
import cloudinary from "../../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    return {
      folder: "compliance_analysis",
      resource_type: "auto",
      public_id: Date.now() + "-" + file.originalname,
    };
  },
});

export const upload = multer({
  storage,
});
