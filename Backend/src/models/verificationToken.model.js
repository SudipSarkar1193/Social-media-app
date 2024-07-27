import mongoose from "mongoose";
import { Schema } from "mongoose";

const tokenSchema = new Schema(
	{
		userId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: "User",
			unique: true,
		},
		token: { type: String, required: true },
	},
	{ timestamps: true }
);

export const VerificationToken = mongoose.model("VerificationToken", tokenSchema);
