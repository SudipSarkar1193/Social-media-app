import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const authenticateUser = asyncHandler(async (req, res, next) => {
	try {
		const accessToken =
			req.cookies?.accessToken ||
			req.header("Authorization")?.replace("Bearer ", "");

		if (!accessToken) {
			throw new APIError(401, "Unauthorized Request");
		}

		const verifiedToken = jwt.verify(
			accessToken,
			process.env.ACCESS_TOKEN_SECRET
		);

		if (!verifiedToken) {
			throw new APIError(401, "Unauthorized Request");
		}

		const user = await User.findById(verifiedToken._id).select(
			"_id username email profileImg username fullName"
		);
		if (!user) {
			throw new APIError(404, "User not found.");
		}
		req.user = user;

		next();
	} catch (error) {
		throw new APIError(500, error.message);
	}
});
