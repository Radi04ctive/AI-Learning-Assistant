import mongoose from "mongoose";

const connectDB = async () => {
  const { MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, MONGO_HOST, MONGO_PORT } = process.env;

  const MONGO_DB = process.env.MONGO_DB || "";
  const uri = `mongodb://${MONGO_ROOT_USER}:${MONGO_ROOT_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`;
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
