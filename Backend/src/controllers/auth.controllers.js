import { User } from "../models/user.model.js";
import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";

const generateAccessAndRefreshToken = async (user) => {
	const accessToken = await user.generateAccessToken();
	const refreshToken = await user.generateRefreshToken();
	user.refreshToken = refreshToken;
	user.save();
	return { accessToken, refreshToken };
};

export const signup = asyncHandler(async (req, res) => {
	const { fullName, username, email, password } = req.body;

	if (
		[fullName, username, email, password].some(
			(fld) => fld == null || fld.trim() === ""
		)
	) {
		throw new APIError(400, "All fields are required");
	}

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(email)) {
		throw new APIError(400, "Invalid Email format");
	}

	if (password.length < 6) {
		throw new APIError(400, "Password lenth must be six or greater");
	}

	const existedUser = await User.findOne({
		$or: [{ username }, { email }],
	});

	if (existedUser) {
		throw new APIError(409, "User with email / username already exists");
	}

	//check for images, check for avatar if exists

	// console.log("req.files", req.files);

	let profileImgLocalPath, coverImgLocalPath;
	coverImgLocalPath = profileImgLocalPath = false;
	if (Object.keys(req.files).length > 0) {
		profileImgLocalPath = req.files?.profileImg[0]?.path;

		coverImgLocalPath = req.files?.coverImg[0]?.path;
	}
	let profileImg = null 
	let coverImg = null;
	if (profileImgLocalPath)
		profileImg = await uploadOnCloudinary(profileImgLocalPath);
	if (coverImgLocalPath)
		coverImg = await uploadOnCloudinary(coverImgLocalPath);

	const newUser = await User.create({
		fullName,
		username,
		email,
		password,
		profileImg: profileImg?.url || null,
		coverImg: coverImg?.url || null,
	});

	const resUser = await User.findById(newUser._id).select(
		"-password -refreshToken"
	);

	return res
		.status(200)
		.json(new APIResponse(200, resUser, "User signed up successfully"));
});

export const login = asyncHandler(async (req, res) => {
	const { username, email, password } = req.body;

	const user = await User.findOne({
		$or: [{ username }, { email }],
	});
	if (!user) {
		throw new APIError(400, "User not found");
	}
	const isPasswordCorrect = await user.isPasswordCorrect(password);

	if (!isPasswordCorrect || !user) {
		throw new APIError(400, "Invalid credential");
	}

	const { accessToken, refreshToken } =
		await generateAccessAndRefreshToken(user);

	const userResponse = user.toObject(); // Convert Mongoose document to plain JavaScript object
	delete userResponse.password;
	delete userResponse.refreshToken;

	const cookieOption = {
		maxAge: 15 * 24 * 60 * 60 * 1000, //MS
		httpOnly: true,
		sameSite: "strict",
		secure: process.env.NODE_ENV !== "development",
	};
	return res
		.cookie("accessToken", accessToken, cookieOption)
		.cookie("refreshToken", refreshToken, cookieOption)
		.json(
			new APIResponse(
				200,
				{ user: userResponse, accessToken, refreshToken },
				"User successfully logged in"
			)
		);
});

export const logout = asyncHandler(async (req, res) => {
	//Get the user
	const user = req.user;
	//Check if authorized
	if (!user) {
		throw new APIError(401, "User is not authorized");
	}
	//Find the user from the DB and set the accessToken to be a null value
	const loggedOutUser = await User.findByIdAndUpdate(
		user._id,
		{
			$set: {
				refreshToken: "",
			},
		},
		{
			new: true,
		}
	);

	// Clear the response cookies
	const cookieOption = {
		httpOnly: true,
		secure: true,
	};

	res
		.status(200)
		.clearCookie("accessToken", cookieOption)
		.clearCookie("refreshToken", cookieOption)
		.json(
			new APIResponse(
				200,
				loggedOutUser,
				`${user.fullName} logged out successfully`
			)
		);
});

export const getCurrentUser = asyncHandler(async (req, res) => {
	const user = await User.findById(req.user._id).select(
		"-password -refreshToken"
	);
	return res.status(200).json(user);
});
