import * as http from "node:http";
import app from "./app";
// import { normalizePort, onError, onListening } from "./utils/utils";
import * as dotenv from "dotenv";
dotenv.config();

const port: string | number = process.env["PORT"] || 1234;

app.set("port", port);

const server: http.Server = http.createServer(app);

// function to connect to database and start server
const startServer = () => {
  try {
    // connect to database
    // await app.locals.db.connect();
    server.listen(port);
    server.on("error", (error: Error) => {
      console.error(error);
    });
    server.on("listening", () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
};
startServer();

// startServer()
//   .then(() => {
//     console.log("🚀 Server started successfully");
//   })
//   .catch((error) => {
//     console.error(error);
//   });

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
