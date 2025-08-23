import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

export const cloudFileUpload = multer({ storage: multer.diskStorage({}) });

export const cloud = () => {
  cloudinary.config({
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    cloud_name: process.env.CLOUD_NAME,
    secure: true,
  });
  return cloudinary;
};

export const uploadfile = async ({ file, path }) => {
  return await cloud().uploader.upload(file.path, {
    folder: `${process.env.APPFOLDER}/${path}`,
    allowed_formats: ["png", "jpeg", "jpg"],
    quality_analysis: true,
  });
};
export const deleteFile = async (public_id) => {
  return await cloud().uploader.destroy(public_id);
};

export const deleteUSer_files = async ({ path }) => {
  await cloud().api.delete_resources_by_prefix(
    `${process.env.APPFOLDER}/${path}`
  );
};
