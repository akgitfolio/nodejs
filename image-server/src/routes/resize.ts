import express, { Router } from "express";
import resizeController from "../controllers/resize";

const router: Router = express.Router();

router.post("/", resizeController.resizeImage);

export default router;
