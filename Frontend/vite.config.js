

import dotenv from "dotenv";
// import {} from "../.env"
dotenv.config({
	path: "../.env",
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		port: process.env.FRONTEND_PORT,
		proxy: {
			"/api": {
				target: `http://localhost:8000`,
				changeOrigin: true,
			},
		},
	},
});
