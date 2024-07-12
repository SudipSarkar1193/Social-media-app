import mongoose from "mongoose";


export const connectDB = async () => {
    try {
      
        const connectionInstance = await mongoose.connect(process.env.DB_URI);
        console.log(`\nDatabase connected !\nHost is : ${connectionInstance.connection.host}\n`);

    } catch (error) {
        console.error("DATABASE CONNECTION ERROR : ",error);
        process.exit(1);
    }
}