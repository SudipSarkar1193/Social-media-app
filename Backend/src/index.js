import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.routes.js";
import { connectDB } from "./db/connect.db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config({
	path: "./.env",
});
const app = express();
app.use(
	cors({
		origin: process.env.CORS_ORIGIN,
		Credential: true, //Very Important
		optionsSuccessStatus: 200, //ok
	})
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

app.get("/", (req, res) => {
	res.json({
		message: "Hello",
	});
});

app.use("/api/v1/auth", authRoute);

app.on("error", (err) => {
	console.log("ERROR:", err);
	throw err;
});

app.listen(process.env.PORT, async () => {
	console.log(`\nServer is running at port : ${process.env.PORT}`);
	await connectDB();
});
