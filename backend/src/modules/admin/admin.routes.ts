import { Router } from "express";
import { AdminController } from "./admin.controller";
import { authenticate, superAdminOnly } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createOrganizationValidation,
  updateOrganizationValidation,
  createUserValidation,
  updateUserValidation,
} from "./admin.validation";

const router = Router();
const controller = new AdminController();

router.use(authenticate);
router.use(superAdminOnly);

// Platform stats
router.get("/stats", controller.getPlatformStats);

// Organizations CRUD
router.get("/organizations", controller.listOrganizations);
router.get("/organizations/:id", controller.getOrganization);
router.post("/organizations", validate(createOrganizationValidation), controller.createOrganization);
router.put("/organizations/:id", validate(updateOrganizationValidation), controller.updateOrganization);
router.delete("/organizations/:id", controller.deleteOrganization);

// Users CRUD (cross-org)
router.get("/users", controller.listUsers);
router.get("/users/:id", controller.getUser);
router.post("/users", validate(createUserValidation), controller.createUser);
router.put("/users/:id", validate(updateUserValidation), controller.updateUser);
router.delete("/users/:id", controller.deleteUser);

export default router;
