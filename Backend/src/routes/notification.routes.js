import express from "express";

import { deleteNotifications, getNotifications } from "../controllers/notification.controllers.js";
import { authenticateUser } from "../middlewares/authenticateUser.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, getNotifications);
router.delete("/", authenticateUser, deleteNotifications);

export default router;