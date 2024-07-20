import Post from "./Post.jsx";
import PostSkeleton from "../skeletons/PostSkeleton.jsx";
import { POSTS } from "../../utils/db/dummy";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const Posts = ({ feedType }) => {
	// const isLoading = false;
	const endPoint = () => {
		const r = "/api/v1/posts";

		switch (feedType) {
			case "forYou":
				return `${r}/all`;
			case "following":
				return `${r}/following`;
			default:
				return `${r}/all`;
		}
	};
	const { data, isLoading, refetch, isRefetching } = useQuery({
		queryKey: ["posts"],
		queryFn: async () => {
			try {
				const res = await fetch(endPoint(), {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				});

				const jsonRes = await res.json();

				if (jsonRes.error || !res.ok) {
					return null;
				}

				return jsonRes.data.posts;
			} catch (error) {
				throw new Error(error);
			}
		},
	});

	//Important !!! 
	//if feed type is changed , we'd want useQuery to refetch the data 

	useEffect(() => {
		refetch();
	}, [feedType, refetch]);


	const posts = Array.isArray(data) ? data : [];

	return (
		<>
			{(isLoading || isRefetching) && (
				<div className="flex flex-col justify-center">
					<PostSkeleton />
					<PostSkeleton />
					<PostSkeleton />
				</div>
			)}
			{!isLoading && posts?.length === 0 && (
				<p className="text-center my-4">No posts in this tab. Switch 👻</p>
			)}
			{!isLoading && posts && (
				<div>
					{posts.map((post) => (
						<Post key={post._id} post={post} />
					))}
				</div>
			)}
		</>
	);
};
export default Posts;
