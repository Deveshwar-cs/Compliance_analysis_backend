// import {CloundinaryPkg} from "cloudinary";
import dotenv from "dotenv";
// import {v2 as cloudinary} from "cloudinary"; //worked

// Second way
import pkg from "cloudinary";
const {v2: cloudinary} = pkg;

dotenv.config();
// const {v2: cloudinary} = CloundinaryPkg;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
