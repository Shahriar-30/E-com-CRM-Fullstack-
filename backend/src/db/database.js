import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri = `${process.env.MONGODB_URL}/${process.env.DATABASE_NAME}`;

    await mongoose.connect(uri);

    console.log("Database Connected Successfully");
  } catch (error) {
    console.log("Database Connection Failed", error.message);
    process.exit(1);
  }
};
