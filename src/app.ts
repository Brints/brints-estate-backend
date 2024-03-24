// import necessary modules
import * as express from "express";
import * as morgan from "morgan";
import * as cors from "cors";
import helmet from "helmet";
import * as multer from "multer";

import { StatusCodes } from "http-status-codes";

// initialize express app
const app: express.Application = express();

// import routes
import routes from "./routes/index.route";

// configure middleware
app.use(
  cors({
    origin: "https://estate.aniebietafia.me",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));
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

// error handling middleware for Multer
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (err instanceof multer.MulterError) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: {
          size: "Image size should not be more than 5MB",
          format: "Image format should be png, jpg or jpeg",
        },
      });
    } else {
      return next(err);
    }
  }
);

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
