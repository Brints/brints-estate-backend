import { Router } from "express";

// import routes
import userRouter from "./user.route";

const router: Router = Router();

// routes
router.use("/user", userRouter);

export default router;
