import { connect, connection } from "mongoose";

// Connect to database
const connectDB = async (): Promise<void> => {
  // Connection string
  const MONGO_URI: string = process.env["MONGO_URL"] || "";
  try {
    await connect(MONGO_URI);
    console.log(`🟢 Database connected successfully: ${connection.host}`);
  } catch (error: unknown) {
    console.log("🔴 Database connection failed");
  }
};

export default connectDB;

// if (error instanceof Error) {
//   console.error(error.message);
// } else {
//   console.error("Unknown error");
// }
