import { Post } from "../models/post.model.js";
import { User } from "../models/user.model.js";
import { Notification } from "../models/notification.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
	deleteFromCloudinary,
	uploadOnCloudinary,
} from "../utils/cloudinary.js";

export const createPost = asyncHandler(async (req, res) => {
	let uid = req.user._id;
	const user = await User.findById(uid).select("-password -refreshToken");

	if (!user) {
		throw new APIError(404, "No user found");
	}

	const { text } = req.body;
	let postImgUrl = null;
	if (Object.keys(req.files).length > 0) {
		const postImgLocalPath = req.files?.postImg[0].path;
		const uploadRes = await uploadOnCloudinary(postImgLocalPath);
		postImgUrl = uploadRes.url;
	}

	if (!postImgUrl && !text) {
		throw new APIError(404, "Text or Image : At least one is required");
	}
	uid = uid.toString();
	const post = await Post.create({
		author: uid,
		text,
		img: postImgUrl,
	});

	if (!post) {
		throw new APIError(500, "Internal server error");
	}

	return res
		.status(200)
		.json(new APIResponse(200, { post }, "New post created successfully"));
});

export const deletePost = asyncHandler(async (req, res) => {
	const { id } = req.params;

	const post = await Post.findById(id);

	if (!post) {
		throw new APIError(404, "No post found");
	}

	if (post.author.toString() != req.user._id) {
		throw new APIError(401, "You are not authorized to delete the post");
	}

	//if the post contains any image : delete from cloudinary:
	if (post.img) {
		await deleteFromCloudinary(post.img);
	}
	const data = await Post.findByIdAndDelete(id);

	return res
		.status(200)
		.json(new APIResponse(200, {}, "Post deleted successfully"));
});

export const likeUnlikePost = asyncHandler(async (req, res) => {
	const { postId } = req.params;
	const userId = req.user._id.toString();

	const post = await Post.findById(postId);
	if (!post) {
		throw new APIError(404, "Post not found");
	}

	const isAlreadyLiked = post.likes.includes(userId);

	const update = isAlreadyLiked
		? { $pull: { likes: userId } }
		: { $push: { likes: userId } };

	const updateLikedPostsArray = isAlreadyLiked
		? { $pull: { likedPosts: postId } }
		: { $push: { likedPosts: postId } };

	const action = isAlreadyLiked ? "unliked" : "liked";

	const updatedPost = await Post.findByIdAndUpdate(postId, update, {
		new: true,
	});

	const updatedUser = await User.findByIdAndUpdate(
		req.user._id,
		updateLikedPostsArray,
		{
			new: true,
		}
	);

	const notification = await Notification.create({
		from: req.user._id,
		to: post.author,
		type: "like",
	});

	return res.status(200).json(new APIResponse(200, {}, `${action} post`));
});

export const commentOnPost = asyncHandler(async (req, res) => {
	const { text } = req.body;
	if (!text) {
		throw new APIError(400, "There should be some text");
	}

	const { postId } = req.params;

	const comment = {
		text,
		author: req.user._id,
	};

	const updatedPost = await Post.findByIdAndUpdate(
		postId,
		{ $push: { comments: comment } },
		{ new: true }
	);

	if (!updatedPost) {
		throw new APIError(404, "Post not found");
	}

	const notification = await Notification.create({
		from: req.user._id,
		to: updatedPost.author,
		type: "comment",
		text,
	});

	return res
		.status(200)
		.json(
			new APIResponse(
				200,
				{ comments: updatedPost.comments, notification },
				"Comment added"
			)
		);
});

export const getAllPosts = asyncHandler(async (req, res) => {
	let { page = 1, limit = 20 } = req.query;
	limit = Number(limit);
	const user = await User.findById(req.user._id).select("following"); //getting user following list as query;

	if (!user) {
		throw new APIError(404, "User not found");
	}

	const followedUser = user.following;

	const posts = await Post.aggregate([
		// Step 1: Add the isFollowedAuthor field
		{
			$addFields: {
				isFollowedAuthor: { $in: ["$author", followedUser] },
			},
		},
		// Step 2: Sort the posts by isFollowedAuthor and createdAt
		{
			$sort: {
				isFollowedAuthor: -1,
				createdAt: -1,
			},
		},
		// Step 3: Pagination
		{
			$skip: (page - 1) * limit,
		},
		{
			$limit: limit,
		},
		// Step 4: Lookup for author details
		{
			$lookup: {
				from: "users",
				localField: "author",
				foreignField: "_id",
				as: "authorDetails",
			},
		},
		{
			$unwind: "$authorDetails",
		},
		{
			$project: {
				"authorDetails.password": 0,
				"authorDetails.refreshToken": 0,
			},
		},
		// Step 5: Unwind comments to perform lookup for each comment's author
		{
			$unwind: {
				path: "$comments",
				preserveNullAndEmptyArrays: true, // To keep posts with no comments
			},
		},
		// Step 6: Lookup for comment author details
		{
			$lookup: {
				from: "users",
				localField: "comments.author",
				foreignField: "_id",
				as: "comments.authorDetails",
			},
		},
		{
			$unwind: {
				path: "$comments.authorDetails",
				preserveNullAndEmptyArrays: true, // To handle comments with no author details
			},
		},
		// Exclude sensitive fields from comments.authorDetails
		{
			$project: {
				"comments.authorDetails.password": 0,
				"comments.authorDetails.refreshToken": 0,
			},
		},
		// Step 7: Group comments back together
		{
			$group: {
				_id: "$_id",
				text: { $first: "$text" },
				img: { $first: "$img" },
				likes: { $first: "$likes" },
				author: { $first: "$author" },
				authorDetails: { $first: "$authorDetails" },
				comments: {
					$push: {
						text: "$comments.text",
						author: "$comments.author",
						authorDetails: "$comments.authorDetails",
					},
				},
				createdAt: { $first: "$createdAt" },
				updatedAt: { $first: "$updatedAt" },
				isFollowedAuthor: { $first: "$isFollowedAuthor" },
			},
		},
		// Step 8: Restore the original sort order
		{
			$sort: {
				isFollowedAuthor: -1,
				createdAt: -1,
			},
		},
	]);

	const totalPosts = await Post.countDocuments();
	const totalPages = Math.ceil(totalPosts / limit);

	if (totalPosts === 0 || posts.length === 0) {
		return res
			.status(200)
			.json(
				new APIResponse(
					200,
					{ posts, totalPosts, totalPages },
					"No post to be retrieved"
				)
			);
	}

	return res
		.status(200)
		.json(
			new APIResponse(
				200,
				{ posts, totalPosts, totalPages },
				"Posts retrieved successfully"
			)
		);
});

export const getAllLikedPosts = asyncHandler(async (req, res) => {
	const { id: userId } = req.params;

	const user = await User.findById(userId).select("likedPosts");
	if (!user) {
		throw new APIError(400, "No user found");
	}
	const likedPostsArray = user.likedPosts;

	const likedPosts = await Post.find({
		_id: { $in: likedPostsArray },
	})
		.populate({
			path: "author",
			select: "-password -refreshToken",
		})
		.populate({
			path: "comments.author",
			select: "-password -refreshToken",
		});

	return res
		.status(200)
		.json(
			new APIResponse(
				200,
				{ likedPosts },
				"All liked posts retrieved successfully"
			)
		);
});

export const getAllFollowingPosts = asyncHandler(async (req, res) => {
	let { page = 1, limit = 20 } = req.query;
	limit = Number(limit);

	const user = await User.findById(req.user._id).select("following");
	if (!user) {
		throw new APIError(500, "User not found");
	}
	const followingUsers = user.following;

	// const posts = await Post.find({ author: { $in: followingUsers } })
	// 	.sort({ createdAt: -1 })
	// 	.populate({
	// 		path: "author",
	// 		select: "-password -refreshToken",
	// 	})
	// 	.populate({
	// 		path: "comments.author",
	// 		select: "-password -refreshToken",
	// 	});

	const posts = await Post.aggregate([
		//step 1 :
		{
			$match: {
				author: { $in: followingUsers },
			},
		},
		// Step 2: Sort the posts by isFollowedAuthor and createdAt
		{
			$sort: {
				createdAt: -1,
			},
		},
		// Step 3: Pagination
		{
			$skip: (page - 1) * limit,
		},
		{
			$limit: limit,
		},
		// Step 4: Lookup for author details
		{
			$lookup: {
				from: "users",
				localField: "author",
				foreignField: "_id",
				as: "authorDetails",
			},
		},
		{
			$unwind: "$authorDetails",
		},
		{
			$project: {
				"authorDetails.password": 0,
				"authorDetails.refreshToken": 0,
			},
		},
		// Step 5: Unwind comments to perform lookup for each comment's author
		{
			$unwind: {
				path: "$comments",
				preserveNullAndEmptyArrays: true, // To keep posts with no comments
			},
		},
		// Step 6: Lookup for comment author details
		{
			$lookup: {
				from: "users",
				localField: "comments.author",
				foreignField: "_id",
				as: "comments.authorDetails",
			},
		},
		{
			$unwind: {
				path: "$comments.authorDetails",
				preserveNullAndEmptyArrays: true, // To handle comments with no author details
			},
		},
		// Exclude sensitive fields from comments.authorDetails
		{
			$project: {
				"comments.authorDetails.password": 0,
				"comments.authorDetails.refreshToken": 0,
			},
		},
		// Step 7: Group comments back together
		{
			$group: {
				_id: "$_id",
				text: { $first: "$text" },
				img: { $first: "$img" },
				likes: { $first: "$likes" },
				author: { $first: "$author" },
				authorDetails: { $first: "$authorDetails" },
				comments: {
					$push: {
						text: "$comments.text",
						author: "$comments.author",
						authorDetails: "$comments.authorDetails",
					},
				},
				createdAt: { $first: "$createdAt" },
				updatedAt: { $first: "$updatedAt" },
				isFollowedAuthor: { $first: "$isFollowedAuthor" },
			},
		},
		// Step 8: Restore the original sort order
		{
			$sort: {
				createdAt: -1,
			},
		},
	]);

	const totalPosts = await Post.countDocuments();
	const totalPages = Math.ceil(totalPosts / limit);

	if (totalPosts === 0 || posts.length === 0) {
		return res
			.status(200)
			.json(
				new APIResponse(
					200,
					{ posts, totalPosts, totalPages },
					"No post to be retrieved"
				)
			);
	}

	return res
		.status(200)
		.json(
			new APIResponse(
				200,
				{ posts, totalPosts, totalPages },
				"Posts retrieved successfully"
			)
		);
});

export const getUserPosts = asyncHandler(async (req, res) => {
	const { username } = req.params;

	const user = await User.findOne({ username });
	if (!user) throw new APIError(404, "User not found");

	const posts = await Post.find({ author: user._id })
		.sort({ createdAt: -1 })
		.populate({
			path: "author",
			select: "-password -refreshToken",
		})
		.populate({
			path: "comments.author",
			select: "-password -refreshToken",
		});

	return res
		.status(200)
		.json(new APIResponse(200, { posts }, "User-Posts retrieved successfully"));
});
