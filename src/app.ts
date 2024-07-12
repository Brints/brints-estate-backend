// import necessary modules
import express from "express";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
// import swaggerJSDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import YAML from "yamljs";
import OpenAPIValidator from "express-openapi-validator";

import { StatusCodes } from "http-status-codes";
import errorHandler from "./middlewares/errorHandler";
import { multerErrorHandler } from "./middlewares/errorHandler";

// initialize express app
const app: express.Application = express();

// load the openapi document
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const openAPIDocument = YAML.load("./documentation.yaml");
// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(openAPIDocument));

// import routes
import routes from "./routes/index.route";

// configure middleware
app.use(cors());
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger Configuration
app.use(
  OpenAPIValidator.middleware({
    apiSpec: "./documentation.yaml",
    validateRequests: true,
    validateResponses: true,
  })
);

// mount routes
app.use("/", routes);

// define index route
app.get("/", (_req: express.Request, res: express.Response) => {
  res.status(StatusCodes.OK).json({
    message: "🚀 Brints Estate Backend Service",
  });
});

// Swagger UI
// const swaggerSpec = swaggerJSDoc(swaggerOptions);
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

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
