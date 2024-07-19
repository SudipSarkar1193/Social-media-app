import { APIError } from "./APIError.js";

export const asyncHandler = (requestHandler) => {
	return async function (req, res, next) {
		try {
			return await requestHandler(req, res, next);
			next();
		} catch (error) {
			// throw new APIError(500,"Internal sever error"); //   App crash korche :find why(Task)
			console.log(error);
			next(error);
		}
	};
};
