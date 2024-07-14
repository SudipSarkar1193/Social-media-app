import express from "express";
import {
	followAndUnfollow,
	getProfile,
	getSuggestedUsers,
	updateUser,
} from "../controllers/user.controllers.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import { upload, uploadFunction } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/profile/:username", authenticateUser, getProfile);
router.post("/follow/:id", authenticateUser, followAndUnfollow);
router.get("/suggestions", authenticateUser, getSuggestedUsers);
router.post(
	"/update",
	upload.fields([
		{
			name: "profileImg",
			maxCount: 1,
		},
		{
			name: "coverImg",
			maxCount: 1,
		},
	]),
	authenticateUser,
	updateUser
);

export default router;
