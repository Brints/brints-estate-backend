import * as http from "node:http";
import app from "./app";
import * as dotenv from "dotenv";
dotenv.config();

// set port
const port: string | number = process.env["PORT"] || 1234;

// import database connection
import connectDB from "./database/connect.database";

// set port
app.set("port", port);

// configure the server
const server: http.Server = http.createServer(app);

// function to connect to database and start server
const startServer = async () => {
  try {
    // connect to database
    await connectDB();

    server.listen(port);
    server.on("error", (error: Error) => {
      console.error(error);
    });
    // server.on("listening", () => {
    //   console.log(`🚀 Server running on port ${port}`);
    // });
  } catch (error) {
    console.error(error);
  }
};

startServer()
  .then(() => {
    console.log("🚀 Server started successfully on port " + port);
  })
  .catch((error) => {
    console.error(error);
  });

// gracefully shutdown server
process.on("SIGINT", () => {
  console.log("👋 Bye bye!");
  process.exit();
});

// handle unhandled promise rejections
process.on("unhandledRejection", (error: Error) => {
  console.error(error);
  process.exit(1);
});

// handle uncaught exceptions
process.on("uncaughtException", (error: Error) => {
  console.error(error);
  process.exit(1);
});
