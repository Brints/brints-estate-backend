// import necessary modules
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";

import { StatusCodes } from "http-status-codes";
import errorHandler from "./middlewares/errorHandler";
import { multerErrorHandler } from "./middlewares/errorHandler";

// initialize express app
const app: express.Application = express();

// import routes
import routes from "./routes/index.route";

// configure middleware
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Brints Estate Backend Service",
      version: "1.0.0",
      description: "REST API for Brints Estate Backend Service",
      contact: {
        name: "Aniebiet Afia",
      },
      servers: [
        {
          url: "http://localhost:3001",
        },
      ],
    },
    schemes: ["http", "https"],
  },
  apis: ["./src/routes/*.ts", "./dist/routes/*.js"],
};

// mount routes
app.use("/", routes);

// define index route
app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(StatusCodes.OK).json({
    message: "🚀 Brints Estate Backend Service",
  });
});

// Swagger UI
const swaggerSpec = swaggerJSDoc(swaggerOptions);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// jwt error handler
app.use(errorHandler);

// error handling middleware for Multer
app.use(multerErrorHandler);

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
