class APIError extends Error {
	constructor(statusCode, message = "Something went wrong", errors = []) {
		super(message);
		this.statusCode = statusCode;
		this.message = message;
		this.data = null; //indicates that no data should be exoected if an error occurs;
		this.success = false;
		this.errors = errors;
	}
}

export {APIError}
