import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton.jsx";
import { useQuery } from "@tanstack/react-query";
import useFollow from "../../custom_hooks/useFollow.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const RightPanel = () => {
	const { data: suggestedUsers, isLoading } = useQuery({
		queryKey: ["suggestedUsers"],
		queryFn: async () => {
			try {
				const res = await fetch("/api/v1/users/suggestions", {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				if (!res.ok) {
					return null;
				}
				const jsonRes = await res.json();

				return await jsonRes.data.suggestions;
			} catch (error) {
				console.log(error.message || "Error fetching suggestions");
			}
		},
		retry: false,
	});

	const { followUnfollow, isPending } = useFollow();

	const handleFollow = async (e, id) => {
		//e.preventDefault();
		const x = followUnfollow(id);
		console.log(" X ", x);
	};

	return (
		<div className="hidden lg:block my-4 mx-2">
			<div className="bg-[#16181C] p-4 rounded-md sticky top-2">
				<p className="font-bold">Who to follow</p>
				<div className="flex flex-col gap-4">
					{/* item */}
					{isLoading && (
						<>
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
							<RightPanelSkeleton />
						</>
					)}
					{!isLoading &&
						suggestedUsers?.map((user) => (
							<Link
								to={`/profile/${user.username}`}
								className="flex items-center justify-between gap-4"
								key={user._id}
							>
								<div className="flex gap-2 items-center">
									<div className="avatar">
										<div className="w-8 rounded-full">
											<img src={user.profileImg || "/avatar-placeholder.png"} />
										</div>
									</div>
									<div className="flex flex-col">
										<span className="font-semibold tracking-tight truncate w-28">
											{user.fullName}
										</span>
										<span className="text-sm text-slate-500">
											@{user.username}
										</span>
									</div>
								</div>
								<div>
									<button
										className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
										onClick={(e) => handleFollow(e, user._id)}
									>
										{isPending ? <LoadingSpinner size="sm" /> : "Follow"}
									</button>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
};
export default RightPanel;
