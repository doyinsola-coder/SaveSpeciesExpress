import express from "express";
import { protect } from "../middlewares/auth.middlewares.js";
import { 
  createReport, 
  getUserReports, 
  getAllReports,
  updateReportStatus,
  deleteReport
} from "../controllers/report.controllers.js";

const router = express.Router();

// User routes
router.post("/", protect, createReport);
router.get("/user", protect, getUserReports);

// Admin routes
router.get("/", protect, getAllReports);
router.put("/:id/status", protect, updateReportStatus);
router.delete("/:id", protect, deleteReport);

export default router;