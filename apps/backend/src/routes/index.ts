import { Router, type IRouter } from "express";
import healthRouter from "./health";
import bookstoreRouter from "./bookstore";

const router: IRouter = Router();

router.use(healthRouter);
router.use(bookstoreRouter);

export default router;
