import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useFollow = () => {
	const queryClient = useQueryClient();

	const { mutate: followUnfollow, isPending } = useMutation({
		mutationFn: async (userId) => {
			try {
				const res = await fetch(`/api/v1/users/follow/${userId}`, {
					method: "POST",
				});

				const jsonRes = await res.json();
                
				if (!res.ok) {
					throw new Error(data.error || "Something went wrong!");
				}
                console.log(jsonRes)
				return jsonRes;
                
			} catch (error) {
				throw error;
			}
		},
		onSuccess: () => {
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ["suggestedUsers"] }),
				queryClient.invalidateQueries({ queryKey: ["authUser"] }),
			]);
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	return { followUnfollow, isPending };
};

export default useFollow;
