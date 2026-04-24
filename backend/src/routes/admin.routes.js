import express from "express";
import {
  approveUser,
  assignUserRole,
  changeAdminPassword,
  deleteUserById,
  getAnalytics,
  getLogs,
  logoutAllDevices,
  resetUserPassword,
  updateAdminProfile,
  updateUserStatus,
} from "../controllers/admin.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import isAdmin from "../middleware/admin.middleware.js";

const router = express.Router();

router.patch("/approve/:userId", protect, isAdmin, approveUser);
router.get("/analytics", protect, isAdmin, getAnalytics);
router.get("/logs", protect, isAdmin, getLogs);

router.put("/profile", protect, isAdmin, updateAdminProfile);
router.patch("/change-password", protect, isAdmin, changeAdminPassword);
router.post("/logout-all", protect, isAdmin, logoutAllDevices);

router.patch("/users/:userId/status", protect, isAdmin, updateUserStatus);
router.delete("/users/:userId", protect, isAdmin, deleteUserById);
router.patch("/users/:userId/reset-password", protect, isAdmin, resetUserPassword);
router.patch("/users/:userId/role", protect, isAdmin, assignUserRole);

export default router;
