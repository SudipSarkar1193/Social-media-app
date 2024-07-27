import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	host: "smtp.gmail.com",
	port: 587,
	secure: false,
	auth: {
		user: process.env.USER,
		pass: process.env.PASS,
	},
});

export const sendMail = async (email, subject, text) => {
	try {
	
		transporter.sendMail({
			from: {
				name: "Xplore",
				address: process.env.USER,
			},
			to: email,
			subject: subject,
			text: text,
		});
	} catch (error) {
		console.log("Mail Not sent");
		console.log(error);
	}
};
