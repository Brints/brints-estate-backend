// import necessary modules
import * as express from "express";
import * as morgan from "morgan";
import * as cors from "cors";
import helmet from "helmet";

import { StatusCodes } from "http-status-codes";

// initialize express app
const app: express.Application = express();

// import routes
import routes from "./routes/index.route";

// configure middleware
app.use(morgan("dev"));
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// mount routes
app.use("/", routes);

// define index route
app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(StatusCodes.OK).json({
    message: "🚀 Brints Estate Backend Service",
  });
});

// define 404 route handler
app.all("*", (_req: express.Request, res: express.Response) => {
  res.status(StatusCodes.NOT_FOUND).json({
    message: "🚫 Route not Found",
  });
});

// global error handler
app.use((err: Error, _req: express.Request, res: express.Response) => {
  console.error(err.stack);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    message: "🚫 Internal Server Error",
  });
});

export default app;
