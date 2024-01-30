import { Router } from "express";

// import routes
import userRouter from "./user.route";
import listingRouter from "./listing.route";

const router: Router = Router();

// routes
router.use("/user", userRouter);
router.use("/listing", listingRouter);

export default router;
