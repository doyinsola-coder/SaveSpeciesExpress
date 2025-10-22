import { Router } from "express";
import { createUser, LoginUser, getUserProfile, updateUser } from "../controllers/users.controllers.js";
import { protect } from "../middlewares/auth.middlewares.js";
const router = Router();

// Auth routes
router.post("/register", createUser);
router.post("/login", LoginUser);
router.get("/profile", protect, getUserProfile);
router.put("/update", protect, updateUser);

// Test route
router.get("/", (req, res) => {
  res.json({ message: "User routes working 🚀" });
});

export default router;
