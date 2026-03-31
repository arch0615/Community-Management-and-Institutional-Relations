import { Router } from "express";
import { AuthController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { registerValidation, loginValidation, updateProfileValidation, changePasswordValidation } from "./auth.validation";
import { authenticate } from "../../middleware/auth";

const router = Router();
const controller = new AuthController();

router.post("/register", validate(registerValidation), controller.register);
router.post("/login", validate(loginValidation), controller.login);
router.get("/profile", authenticate, controller.getProfile);
router.put("/profile", authenticate, validate(updateProfileValidation), controller.updateProfile);
router.put("/password", authenticate, validate(changePasswordValidation), controller.changePassword);

export default router;
