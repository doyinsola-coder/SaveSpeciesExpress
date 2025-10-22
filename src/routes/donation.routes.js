import express from "express";
import {
  initiatePaystackPayment,
  verifyPaystackPayment,
} from "../controllers/donation.controllers.js";

const router = express.Router();

router.post("/initiate", initiatePaystackPayment);
router.get("/verify", verifyPaystackPayment);

export default router;
