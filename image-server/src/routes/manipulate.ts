import express, { Router } from "express";
import manipulateController from "../controllers/manipulate";

const router: Router = express.Router();

router.post("/", manipulateController.manipulateImage);

export default router;
