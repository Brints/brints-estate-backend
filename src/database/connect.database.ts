import { connect, connection } from "mongoose";

// Connection string
const MONGO_URI: string = process.env["MONGO_URL"] || "";

// Connection options
// const options: ConnectionOptions = {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
//   useFindAndModify: false,
//   useCreateIndex: true,
// };

// Connect to database
const connectDB = async (): Promise<void> => {
  try {
    await connect(MONGO_URI);
    console.log(`🟢 Database connected successfully: ${connection.host}`);
  } catch (error: unknown) {
    console.log("🔴 Database connection failed");
    console.error(error);
  }
};

export default connectDB;
