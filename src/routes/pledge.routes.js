import express from "express";
import { createPledge, getAllPledges } from "../controllers/pledge.controllers.js";

const router = express.Router();
router.post("/", createPledge);
router.get("/", getAllPledges);
export default router;
