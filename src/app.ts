import { Request, Response } from "express";
import * as express from "express";

const app = express();

app.get("/", (_req: Request, res: Response) => {
  res.send("Hello World");
});
