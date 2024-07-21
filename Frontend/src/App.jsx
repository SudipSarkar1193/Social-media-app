import React, { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { toast, Toaster } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "./components/common/LoadingSpinner";
// import "./index.css";

const App = () => {
	const { data: authUser, isLoading } = useQuery({
		queryKey: ["userAuth"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/v1/auth/me", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const jsonRes = await res.json();

				if (jsonRes.error || !res.ok) {
					return null;
				}
				return jsonRes;
			} catch (error) {
				throw new Error(error);
			}
		},

		retry: false,
	});

	if (isLoading) {
		return (
			<div className="h-screen w-screen flex items-center justify-center">
				<LoadingSpinner size="lg" />
			</div>
		);
	}

	return (
		<div className="flex max-w-6xl mx-auto no-scrollbar">
			{authUser && <Sidebar />}

			<Routes>
				<Route
					path="/"
					element={authUser ? <HomePage /> : <Navigate to="/login" />}
				></Route>
				<Route
					path="/signup"
					element={!authUser ? <RegisterPage /> : <Navigate to="/" />}
				></Route>
				<Route
					path="/login"
					element={!authUser ? <LoginPage /> : <Navigate to="/" />}
				></Route>
				<Route
					path="/notifications"
					element={authUser ? <NotificationPage /> : <Navigate to="/login" />}
				/>
				<Route
					path="/profile/:username"
					element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
				/>
			</Routes>

			{authUser && <RightPanel />}
			<Toaster />
		</div>
	);
};

export default App;
