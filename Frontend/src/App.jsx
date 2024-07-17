import React, { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage"

const App = () => {
	const location = useLocation();
	const isAuthPage =
		location.pathname === "/login" || location.pathname === "/signup";
	return (
		<div className="flex max-w-6xl mx-auto">
			{!isAuthPage && <Sidebar />}
			<Routes>
				<Route path="/" element={<HomePage />}></Route>
				<Route path="/signup" element={<RegisterPage />}></Route>
				<Route path="/login" element={<LoginPage />}></Route>
				<Route path="/notifications" element={<NotificationPage />} />
				<Route path="/profile/:username" element={<ProfilePage />} />
			</Routes>
			{!isAuthPage && <RightPanel />}
		</div>
	);
};

export default App;
