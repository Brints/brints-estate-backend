import { Router } from "express";

// import routes
import adminRoute from "./admin.route";
import userRouter from "./user.route";
import listingRouter from "./listing.route";
import favoriteRouter from "./favorites.route";

const router: Router = Router();

// routes
router.use("/admin", adminRoute);
router.use("/user", userRouter);
router.use("/listing", listingRouter);
router.use("/listings", favoriteRouter);

export default router;
