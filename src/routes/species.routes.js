import express from "express";
import { getAllSpecies, getSpeciesByName } from "../controllers/species.controllers.js";

const router = express.Router();

// Get all species
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    const species = await getAllSpecies(category); // category can be undefined
    res.status(200).json({
      message: "Fetched all species",
      count: species.length,
      data: species,
    });
  } catch (error) {
    console.error("Error fetching all species:", error);
    res.status(500).json({ message: error.message });
  }
});

// Get species by name
router.get("/:name", getSpeciesByName);

export default router;
