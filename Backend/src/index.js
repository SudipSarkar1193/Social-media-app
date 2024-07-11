import express from "express";
import dotenv from "dotenv";
import authRoute from "./routes/auth.routes.js";
import { connectDB } from "./db/connect.db.js";

dotenv.config({
    path: './.env'
})
const app = express();

app.get("/", (req, res) => {
	res.json({
		message: "Hello",
	});
});

connectDB()
	.then(() => {
		app.on("error", (err) => {
			console.log("ERROR:", err);
			throw err;
		});
		app.listen(process.env.PORT, () => {
			console.log(`Server is running at port : ${process.env.PORT}`);
		});
	})
	.catch((err) => {
		console.log("Mongodb connection failed !!! \n", err);
	});


