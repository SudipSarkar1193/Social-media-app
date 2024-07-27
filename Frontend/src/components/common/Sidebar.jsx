import XSvg from "../svgs/X";

import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { IoIosPersonAdd } from "react-icons/io";
import RightPanel from "./RightPanel";
// import { IoMenu } from "react-icons/io5";

const Sidebar = () => {
	const queryClient = useQueryClient();

	//Logout :

	const {
		mutate: logout,
		isError,
		isPending,
		error,
	} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("/api/v1/auth/logout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const jsonRes = await res.json();

				if (jsonRes.error)
					throw new Error(jsonRes.message || "Failed to Log out");

				return jsonRes;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["userAuth"] });
		},
		onError: (error) => {
			console.error(error.message);
			toast.error(error.message);
		},
	});

	const { data: authUser } = useQuery({ queryKey: ["userAuth"] });

	return (
		<div className="z-50 bg-red">
			<dialog id="my_modal_2" className="modal">
				<div className="modal-box">
					<form method="dialog">
						{/* if there is a button in form, it will close the modal */}
						<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
							✕
						</button>
					</form>
					<RightPanel con={true} />
				</div>
			</dialog>
			<div className="md:flex md:flex-[2_2_0] md:w-18 md:max-w-52 ">
				{/* Mobile layout */}
				<div className="fixed bottom-0 left-0 w-full md:hidden bg-black border-t border-gray-700 flex justify-around items-center py-2">
					<Link
						to="/"
						className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full py-2 px-4"
					>
						<MdHomeFilled className="w-6 h-6" />
					</Link>
					<Link
						to="/notifications"
						className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full py-2 px-4"
					>
						<IoNotifications className="w-6 h-6" />
					</Link>
					<Link
						to={`/profile/${authUser?.username}`}
						className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full py-2 px-4"
					>
						<FaUser className="w-6 h-6" />
					</Link>

					<span
						className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full py-2 px-4"
						onClick={() => document.getElementById("my_modal_2").showModal()}
					>
						<IoIosPersonAdd size={30} />
					</span>

					{authUser && (
						<div className="flex items-center gap-2">
							<BiLogOut
								className="w-5 h-5 cursor-pointer"
								onClick={(e) => {
									e.preventDefault();
									logout();
								}}
							/>
						</div>
					)}
				</div>

				<div className="sticky top-0 left-0 h-screen lg:flex flex-col border-r border-gray-700 w-20 md:w-full hidden md:flex">
					<Link to="/" className="flex justify-center md:justify-start">
						<XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-secondary" />
					</Link>
					<ul className="flex flex-col gap-3 mt-4">
						<li className="flex justify-center md:justify-start">
							<Link
								to="/"
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
							>
								<MdHomeFilled className="w-8 h-8" />
								<span className="text-lg hidden md:block">Home</span>
							</Link>
						</li>
						<li className="flex justify-center md:justify-start">
							<Link
								to="/notifications"
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
							>
								<IoNotifications className="w-6 h-6" />
								<span className="text-lg hidden md:block">Notifications</span>
							</Link>
						</li>
						<li className="flex justify-center md:justify-start">
							<Link
								to={`/profile/${authUser?.username}`}
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
							>
								<FaUser className="w-6 h-6" />
								<span className="text-lg hidden md:block">Profile</span>
							</Link>
						</li>
						<li>
							<span
								className="flex gap-3 items-center hover:bg-secondary transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer lg:hidden"
								onClick={() =>
									document.getElementById("my_modal_1").showModal()
								}
							>
								<IoIosPersonAdd className="w-6 h-6" />
								<span className="text-lg hidden md:block">Suggested Users</span>
							</span>
						</li>
						<dialog id="my_modal_1" className="modal">
							<div className="modal-box">
								<form method="dialog">
									{/* if there is a button in form, it will close the modal */}
									<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
										✕
									</button>
								</form>
								<RightPanel con={true} />
							</div>
						</dialog>
					</ul>
					{authUser && (
						<Link
							to={`/profile/${authUser?.username}`}
							className="mt-auto mb-10 flex gap-2 items-start transition-all duration-300 hover:bg-secondary py-2 px-4 rounded-full"
						>
							<div className="avatar hidden md:inline-flex">
								<div className="w-8 rounded-full">
									<img
										src={authUser?.profileImg || "/avatar-placeholder.png"}
										alt="Profile"
									/>
								</div>
							</div>
							<div className="flex justify-between flex-1">
								<div className="hidden md:block">
									<p className="text-white font-bold text-sm w-20 truncate">
										{authUser?.fullName}
									</p>
									<p className="text-slate-500 text-sm">
										@{authUser?.username}
									</p>
								</div>
								<BiLogOut
									className="w-5 h-5 cursor-pointer"
									onClick={(e) => {
										e.preventDefault();
										logout();
									}}
								/>
							</div>
						</Link>
					)}
				</div>
			</div>
		</div>
	);
};
export default Sidebar;
