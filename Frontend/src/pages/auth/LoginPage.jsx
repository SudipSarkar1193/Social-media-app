import React, { useState } from "react";
import XSvg from "../../components/svgs/X";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { set } from "mongoose";
import { json, Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

const LoginPage = () => {
	const [formData, setFormData] = useState({
		usernameOrEmail: "",
		password: "",
	});

	const queryClient = useQueryClient();

	const {
		mutate: login,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: async ({ usernameOrEmail, password }) => {
			try {
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				let username = null,
					email = null;
				if (emailRegex.test(usernameOrEmail)) {
					email = usernameOrEmail;
				} else {
					username = usernameOrEmail;
				}

				const res = await fetch("/api/v1/auth/login", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ username, email, password }),
				});

				const jsonRes = await res.json();
				console.log(jsonRes);

				if (!res.ok) {
					throw new Error(jsonRes.message || "Failed to Log in");
				}
				return jsonRes;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userAuth"] });
			queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] });
		},
		onError: (error) => {
			console.error(error.message);
			toast.error(error.message);
		},
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		login(formData);
	};

	return (
		<div className="max-w-screen-xl mx-auto flex h-screen px-10">
			<div className="flex-1 hidden lg:flex items-center  justify-center">
				{" "}
				{/* Use flex-1 to allow a flex item to  grow and shrink as needed, ignoring its initial size: */}
				<XSvg className=" lg:w-2/3 fill-white" />
			</div>

			<div className="flex-1 flex flex-col justify-center items-center">
				<form
					className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
					onSubmit={handleSubmit}
				>
					<XSvg className="w-24 lg:hidden fill-white mx-auto" />
					<h1 className="text-4xl font-extrabold text-white mx-auto">
						Let's Go.
					</h1>

					<label className="input input-bordered flex items-center gap-2">
						<MdOutlineMail />
						<FaUser />
						<input
							type="text"
							name="usernameOrEmail"
							className="grow"
							placeholder="Email or Username"
							value={formData.usernameOrEmail}
							onChange={handleInputChange}
						/>
					</label>

					<label className="input input-bordered flex items-center gap-2">
						<MdPassword />
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							placeholder="Password"
							className="grow"
							value={formData.password}
							onChange={handleInputChange}
						/>
						{showPassword ? (
							<FaEye onClick={() => setShowPassword(false)} />
						) : (
							<FaEyeSlash onClick={() => setShowPassword(true)} />
						)}
					</label>
					<button className="btn rounded-full btn-primary text-white">
						Sign in
					</button>
					{isError && <p className="text-red-500">Something went wrong</p>}
				</form>

				<div className="flex flex-col lg:w-2/3  lg:bg-red gap-2 mt-4">
					<p className="text-white text-lg">Don't have an account ?</p>
					<Link to="/signup">
						<button className="btn rounded-full btn-primary text-white btn-outline w-full">
							Sign up
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
