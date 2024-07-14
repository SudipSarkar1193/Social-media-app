import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { APIError } from "./APIError.js";
// Configuration
cloudinary.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.CLOUD_API_KEY,
	api_secret: process.env.CLOUD_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

export const uploadOnCloudinary = async function (
	localFilePath,
	height,
	width,
	public_id
) {
	try {
		if (!localFilePath) {
			console.log("No Local File Path found");
			return;
		}

		const uploadFileResponse = await cloudinary.uploader.upload(localFilePath, {
			public_id: public_id,
			resource_type: "auto",
			transformation: [
				{ width: width, height: height, crop: "fit" },
				{ quality: "auto:best" },
			],
		});

		//STEP : Delete the temporary files locally
		try {
			fs.unlinkSync(localFilePath);
		} catch (err) {
			console.error(`Error deleting the file locally: ${localFilePath}`, err);
		}

		return uploadFileResponse;
	} catch (error) {
		console.log("ERROR uploading file : ", error);

		try {
			fs.unlinkSync(localFilePath);
		} catch (err) {
			console.error(`Error deleting the file locally: ${localFilePath}`, err);
		} // removing the locally saved temporary file as the upload operation failed

		return null;
	}
};

export const deleteFromCloudinary = async (url) => {
	try {
		cloudinary.uploader.destroy(url.split("/").pop().split(".")[0]);
	} catch (error) {
		console.log(error.message);
		throw new APIError(500, "Error deleting image from the cloudinary");
	}
};

