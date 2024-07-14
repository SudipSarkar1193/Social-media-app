import multer from "multer";

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, "./Backend/public/temp");
	},
	filename: function (req, file, cb) {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, file.fieldname + "-" + uniqueSuffix);
	},
});

export const upload = multer({ storage: storage });
export const uploadFunction = async(req,res,next) => {
	upload.fields([
		{
			name: "profileImg",
			maxCount: 1,
		},
		{
			name: "coverImg",
			maxCount: 1,
		},
	])
	next();
}
