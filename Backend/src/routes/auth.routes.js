import express from "express";
import { getCurrentUser, login, logout, signup } from "../controllers/auth.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";
import { get } from "mongoose";

const router = express.Router();

router.post(
	"/signup",
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
	signup
);
router.post("/login", login);

//SECURE routes

router.post("/logout",authenticateUser,logout)

router.get("/me",authenticateUser,getCurrentUser)

export default router;
