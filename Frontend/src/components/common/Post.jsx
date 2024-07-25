import { FaRegComment } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { FaRegHeart } from "react-icons/fa";
import { FaRegBookmark } from "react-icons/fa6";
import { FaTrash } from "react-icons/fa";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import LoadingSpinner from "./LoadingSpinner";
import { timeAgo } from "../../utils/timeAgo.js";

const Post = ({ post }) => {
	const [comment, setComment] = useState("");
	const postOwner = post.authorDetails || post.author;

	//console.log("postOwner", postOwner);
	const formattedDate = timeAgo(post.createdAt);

	const { data: authUser } = useQuery({ queryKey: ["userAuth"] }); //⭐⭐

	const isMyPost = authUser?._id === post.author;

	const queryClient = useQueryClient();

	//delete post:
	const {
		data,
		mutate: deletePost,
		isPending: isPendingDelete,
		isError: isErrorDelete,
	} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/v1/posts/${post._id}`, {
					method: "DELETE",
				});

				const jsonRes = await res.json();

				if (jsonRes.error) {
					throw new Error(jsonRes.error || "Failed to delete Post");
				}

				return jsonRes;
			} catch (error) {
				throw error;
			}
		},

		onSuccess: () => {
			toast.success("Post deleted successfully");
			//invalidate the post query to refetch the post-data
			queryClient.invalidateQueries({ queryKey: ["posts"] });
		},
		onError: (error) => {
			console.error(error.message);
			toast.error(error.message);
		},
	});

	const handleDeletePost = (e) => {
		e.preventDefault();
		deletePost();
	};

	const { mutate: commentPost, isPending: isCommenting } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/v1/posts/comment/${post._id}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ text: comment }),
				});
				const data = await res.json();

				if (!res.ok) {
					throw new Error(data.error || "Something went wrong");
				}
				return data;
			} catch (error) {
				throw new Error(error);
			}
		},
		onSuccess: (data) => {
			const comments = data.data.updatedPost[0].comments;

			toast.success("Comment posted successfully");
			setComment("");

			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, comments };
					}
					return p;
				});
			});
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const handlePostComment = (e) => {
		e.preventDefault();
		if (isCommenting) return;
		commentPost();
	};

	const { mutate: like, isPending: isLiking } = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch(`/api/v1/posts/like/${post._id}`, {
					method: "POST",
				});

				if (!res.ok) {
					throw new Error("Error liking the post");
				}

				const jsonRes = await res.json();

				return jsonRes;
			} catch (error) {
				throw error;
			}
		},
		onSuccess: (data) => {
			const updatedLikes = data.data.updatedLikes;

			toast.success(data.message);

			// queryClient.invalidateQueries({ queryKey: ["posts"] });
			// instead, update the cache directly for that post

			queryClient.setQueryData(["posts"], (oldData) => {
				return oldData.map((p) => {
					if (p._id === post._id) {
						return { ...p, likes: updatedLikes };
					}
					return p;
				});
			});
		},
		onError: (err) => {
			toast.error(err.message);
		},
	});

	const isLiked = post.likes.includes(authUser._id);

	const handleLikePost = () => {
		if (isLiking) return;
		like();
	};

	const filteredComments = post.comments.filter(
		(comment) => Object.keys(comment).length > 0
	);

	return (
		<div className="overflow-y-hidden no-scrollbar">
			<div className="flex gap-2 items-start p-4 border-b border-gray-700 overflow-y-hidden no-scrollbar">
				<div className="avatar">
					<Link
						to={`/profile/${postOwner?.username}`}
						className="w-8 rounded-full overflow-hidden"
					>
						<img
							src={
								postOwner?.profileImg ||
								"./avatar-placeholder.png"
							}
						/>
					</Link>
				</div>
				<div className="flex flex-col flex-1 z-10">
					<div className="flex gap-2 items-center">
						<Link to={`/profile/${postOwner?.username}`} className="font-bold">
							{postOwner?.fullName}
						</Link>
						<span className="text-gray-700 flex gap-1 text-sm">
							<Link to={`/profile/${postOwner?.username}`}>
								@{postOwner?.username}
							</Link>
							<span>·</span>
							<span>{formattedDate}</span>
						</span>
						{isMyPost && !isPendingDelete && (
							<span className="flex justify-end flex-1">
								<FaTrash
									className="cursor-pointer hover:text-red-500"
									onClick={() =>
										document.getElementById("my_modal_1").showModal()
									}
								/>
							</span>
						)}

						{isPendingDelete && <LoadingSpinner />}
					</div>

					<div className="flex flex-col gap-3 overflow-hidden">
						<span>{post.text}</span>
						{post.img && (
							<img
								src={post.img}
								className="h-80 object-contain rounded-lg border border-gray-700"
								alt=""
							/>
						)}
					</div>
					<div className="flex justify-between mt-3">
						<div className="flex gap-4 items-center w-2/3 justify-between">
							<div
								className="flex gap-1 items-center cursor-pointer group"
								onClick={() =>
									document
										.getElementById("comments_modal" + post._id)
										.showModal()
								}
							>
								<FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
								<span className="text-sm text-slate-500 group-hover:text-sky-400">
									{filteredComments?.length}
								</span>
							</div>
							{/* We're using Modal Component from DaisyUI */}

							<dialog
								id={`comments_modal${post._id}`}
								className="modal border-none outline-none"
							>
								<div className="modal-box rounded border border-gray-600">
									<h3 className="font-bold text-lg mb-4">COMMENTS</h3>
									<div className="flex flex-col gap-3 max-h-60 overflow-auto">
										{filteredComments.length === 0 && (
											<p className="text-sm text-slate-500">
												No comments yet 🤔 Be the first one 😉
											</p>
										)}
										{post.comments.map((comment) => (
											<div key={comment._id} className="flex gap-2 items-start">
												<div className="avatar">
													<div className="w-8 rounded-full">
														<img
															src={
																comment.authorDetails?.profileImg ||
																"/avatar-placeholder.png"
															}
														/>
													</div>
												</div>
												<div className="flex flex-col">
													<div className="flex items-center gap-1">
														<span className="font-bold">
															{comment.authorDetails?.fullName}
														</span>
														<span className="text-gray-700 text-sm">
															@{comment.authorDetails?.username}
														</span>
													</div>
													<div className="text-sm">{comment.text}</div>
												</div>
											</div>
										))}
									</div>
									<form
										className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2"
										onSubmit={handlePostComment}
									>
										<textarea
											className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none  border-gray-800"
											placeholder="Add a comment..."
											value={comment}
											onChange={(e) => setComment(e.target.value)}
										/>
										<button className="btn btn-primary rounded-full btn-sm text-white px-4">
											{isCommenting ? (
												<span className="loading loading-spinner loading-md"></span>
											) : (
												"Post"
											)}
										</button>
									</form>
								</div>
								<form method="dialog" className="modal-backdrop">
									<button className="outline-none">close</button>
								</form>
							</dialog>

							<div className="flex gap-1 items-center group cursor-pointer">
								<BiRepost className="w-6 h-6  text-slate-500 group-hover:text-green-500" />
								<span className="text-sm text-slate-500 group-hover:text-green-500">
									0
								</span>
							</div>
							<div
								className="flex gap-1 items-center group cursor-pointer"
								onClick={handleLikePost}
							>
								{isLiking && <LoadingSpinner size="sm" />}
								{!isLiked && !isLiking && (
									<FaRegHeart className="w-4 h-4 cursor-pointer text-slate-500 group-hover:text-pink-500" />
								)}
								{isLiked && !isLiking && (
									<FaRegHeart className="w-4 h-4 cursor-pointer text-pink-500 " />
								)}

								<span
									className={`text-sm text-slate-500 group-hover:text-pink-500 ${
										isLiked ? "text-pink-500" : ""
									}`}
								>
									{post.likes.length}
								</span>
							</div>
						</div>
						<div className="flex w-1/3 justify-end gap-2 items-center">
							<FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
						</div>
					</div>
				</div>

				<dialog id="my_modal_1" className="modal modal-bottom sm:modal-middle">
					<div className="modal-box">
						<h3 className="font-bold text-lg">Confirm !</h3>
						<p className="py-4">Do you really want to delete the post ?</p>
						<div className="modal-action-custom">
							<button className="btn-custom-2" onClick={handleDeletePost}>
								Yes
							</button>
							<form method="dialog">
								{/* if there is a button in form, it will close the modal */}
								<button className="btn-custom-1">Cancel</button>
							</form>
						</div>
					</div>
				</dialog>
			</div>
		</div>
	);
};
export default Post;
