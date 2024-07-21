import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
} from "../utils/cloudinary.js";

export const getProfile = asyncHandler(async (req, res) => {
	const { username } = req.params;
	const user = await User.findOne({ username }).select(
		"-password -refreshToken"
	);
	if (!user) {
		throw new APIError(404, "User not found");
	}
	return res
		.status(200)
		.json(new APIResponse(200, user, "Got User profile successfully"));
});

export const followAndUnfollow = asyncHandler(async (req, res) => {
	const { id } = req.params;

	if (id === req.user._id.toString()) {
		throw new APIError(400, "You can't follow / unfollow yourself");
	}

	const modifyUser = await User.findById(id);
	const currentUser = await User.findById(req.user._id);

	if (!modifyUser || !currentUser) {
		throw new APIError(400, "User not found");
	}

	let flag, notification;

	if (currentUser.following.includes(modifyUser._id)) {
		//unfollow :
		await User.findByIdAndUpdate(id, {
			$pull: {
				followers: req.user._id,
			},
		});
		await User.findByIdAndUpdate(req.user._id, {
			$pull: {
				following: id,
			},
		});
		notification = "";
		flag = false;
	} else {
		//follow  :
		await User.findByIdAndUpdate(req.user._id, {
			$push: {
				following: id,
			},
		});
		await User.findByIdAndUpdate(id, {
			$push: {
				followers: req.user._id,
			},
		});

		notification = await Notification.create({
			from: currentUser._id,
			to: modifyUser._id,
			type: "follow",
		});

		flag = true;
	}

	const actionType = flag ? "followed" : "unfollowed";

	return res.status(200).json(
		new APIResponse(
			200,
			{
				notification,
			},
			`${currentUser.fullName.split(" ")[0]} ${actionType} ${modifyUser.fullName.split(" ")[0]}`
		)
	);
});

export const getSuggestedUsers = asyncHandler(async (req, res) => {
	const { _id } = req.user;

	// Get the current user to find their following list
	const currentUser = await User.findById(_id).select("following");

	if (!currentUser) {
		throw new APIError(400, "User not found");
	}

	// Use aggregation to find suggested users
	const suggestions = await User.aggregate([
		{
			$match: {
				_id: { $ne: _id, $nin: currentUser.following },
			},
		},
		{ $sample: { size: 10 } }, // Randomly select 10 users
	]);

	suggestions.forEach((user) => {
		user.password = null;
		user.refreshToken = null;
	});

	if (!suggestions) {
		throw new APIError(500, "No suggested user found");
	}

	return res
		.status(200)
		.json(new APIResponse(200, { suggestions }, "fetched suggested users"));
});

export const updateUser = asyncHandler(async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } =
		req.body;

	let profileImgLocalPath, coverImgLocalPath;
	coverImgLocalPath = profileImgLocalPath = false;
	if (Object.keys(req.files).length > 0) {
		profileImgLocalPath = req.files?.profileImg[0]?.path;

		coverImgLocalPath = req.files?.coverImg[0]?.path;
	}

	const userId = req.user._id;

	let user = await User.findById(userId);
	if (!user) throw new APIError(404, "User not found");

	if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
		throw new APIError(
			400,
			"Please provide both current password and new password"
		);
	}

	if (currentPassword && newPassword) {
		const isMatch = await user.isPasswordCorrect(newPassword);

		if (!isMatch) throw new APIError(400, "Incorrect password");

		if (currentPassword == newPassword) {
			throw new APIError(400, "Enter new password to change");
		}

		if (newPassword.length < 6) {
			throw new APIError(400, "Password must be at least 6 characters long");
		}

		user.password = newPassword;
	}

	if (profileImgLocalPath) {
		if (user.profileImg) {
			// https://res.cloudinary.com/dyfqon1v6/image/upload/v1712997552/zmxorcxexpdbh8r0bkjb.png
			await deleteFromCloudinary(user.profileImg);
		}
		const profileImgUploadResponse =
			await uploadOnCloudinary(profileImgLocalPath);
		user.profileImg = profileImgUploadResponse.url;
	}

	if (coverImgLocalPath) {
		if (user.coverImg) {
			await deleteFromCloudinary(user.coverImg);
		}
		const coverImgUploadResponse = await uploadOnCloudinary(coverImgLocalPath);
		user.coverImg = coverImgUploadResponse.url;
	}

	user.fullName = fullName || user.fullName;
	user.email = email || user.email;
	user.username = username || user.username;
	user.bio = bio || user.bio;
	user.link = link || user.link;

	user = await user.save();

	// password should be null in response
	user.password = null;

	return res.status(200).json(new APIResponse(200, { user }));
});
