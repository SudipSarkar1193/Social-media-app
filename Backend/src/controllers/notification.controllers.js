import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Notification } from "../models/notification.model.js";
export const getNotifications = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	const notifications = await Notification.find({ to: userId }).populate({
		path: "from",
		select: "username profileImg",
	});
	if (!notifications) {
		throw new APIError(500, "No notification is found");
	}
	await Notification.updateMany({ to: userId }, { read: true });

	return res
		.status(200)
		.json(
			new APIResponse(
				200,
				{ notifications },
				"Notification retrieved successfully"
			)
		);
});

export const deleteNotifications = asyncHandler(async (req, res) => {
	const userId = req.user._id;

	await Notification.deleteMany({ to: userId });

	return res
		.status(200)
		.json(new APIResponse(200, {}, "Notifications deleted successfully"));
});
