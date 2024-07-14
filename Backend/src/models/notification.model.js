import mongoose from "mongoose";

const notiSchema = new mongoose.Schema({
	from: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	type: {
		type: String,
		enum: ["follow", "like", "comment"],
		required: true,
	},
    read:{
        type:Boolean,
        default:false
    }
},{timestamps:true});

export const Notification = new mongoose.model("Notification", notiSchema);
