import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";

export const ApiErrorResponseHandler = (err, req, res, next) => {
	if (err instanceof APIError) {
		return res
			.status(err.statusCode)
			.json({
				...new APIResponse(err.statusCode, null, err.message),
				error: err.message,
			});
	}
	// res.status(500).json(new APIResponse(500, null, "Internal Server Error"));
};
