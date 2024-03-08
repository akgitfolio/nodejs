import express, { Router } from "express";
import manipulate from "./manipulate";
import resize from "./resize";

const router: Router = express.Router();

router.use("/resize", resize);
router.use("/manipulate", manipulate);

export default router;
