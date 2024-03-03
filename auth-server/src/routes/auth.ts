import { Router } from "express";
import AuthController from "../controllers/AuthController";
import { checkJwt } from "../middlewares/checkJwt";

const router = Router();

router.get("/", (req, res) => res.send("Hello Auth"));
router.post("/login", AuthController.login);
router.post("/register", AuthController.register);
router.post("/change-password", [checkJwt], AuthController.changePassword);

export default router;
