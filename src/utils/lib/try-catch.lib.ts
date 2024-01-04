import { Request, Response, NextFunction } from "express";

type AsyncFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>;

const tryCatch = (fn: AsyncFunction) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    return fn(req, res, next).catch(next);
  };
};

export default tryCatch;
