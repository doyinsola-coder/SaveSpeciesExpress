import axios from "axios";
import Species from "../models/species.js";

const IUCN_TOKEN = process.env.IUCN_TOKEN;
const IUCN_BASE_URL = "https://api.iucnredlist.org/api/v4";

// ✅ Fetch species by name (with caching)
export const getSpeciesByName = async (speciesName) => {
  try {
    if (!IUCN_TOKEN) {
      throw new Error("IUCN_TOKEN not configured");
    }

    // Use /name/ endpoint to search by species name
    const response = await axios.get(
      `${IUCN_BASE_URL}/advanced_search?name=${encodeURIComponent(speciesName)}&token=${IUCN_TOKEN}`
    );

    const results = response.data?.result;
    if (!results || results.length === 0) {
      throw new Error("Species not found");
    }

    const data = results[0];
    
    // Transform IUCN data to match your Species model
    const speciesData = {
      scientific_name: data.name || speciesName,
      common_name: data.common_names?.[0]?.common_name || "",
      category: data.assessment_date ? data.category : "NOT_EVALUATED",
      description: data.taxonomy?.habitats?.[0]?.habitat_description || "",
      image: data.picture_url || "",
      status: data.category || "Unknown",
      iucn_id: data.taxonid,
    };

    const saved = await Species.findOneAndUpdate(
      { scientific_name: speciesData.scientific_name },
      speciesData,
      { new: true, upsert: true }
    );

    return saved;
  } catch (error) {
    console.error("Error fetching species from IUCN:", error.message);
    throw new Error(`Failed to fetch species: ${error.message}`);
  }
};

// ✅ Get all cached species (optionally filtered by category)
export const getAllSpecies = async (category) => {
  try {
    const filter = category ? { category: category.toUpperCase() } : {};
    const species = await Species.find(filter).sort({ scientific_name: 1 });
    return species;
  } catch (error) {
    console.error("Error fetching all species:", error.message);
    throw new Error("Failed to fetch species from database");
  }
};

// ✅ Search multiple species and cache them
export const searchMultipleSpecies = async (speciesNames) => {
  const results = [];
  
  for (const name of speciesNames) {
    try {
      const species = await getSpeciesByName(name);
      results.push(species);
    } catch (error) {
      console.warn(`Could not fetch ${name}:`, error.message);
    }
  }
  
  return results;
};

// ✅ Fetch species by IUCN ID
export const getSpeciesById = async (iucnId) => {
  try {
    if (!IUCN_TOKEN) {
      throw new Error("IUCN_TOKEN not configured");
    }

    const response = await axios.get(
      `${IUCN_BASE_URL}/id/${iucnId}?token=${IUCN_TOKEN}`
    );

    const data = response.data?.result?.[0];
    if (!data) throw new Error("Species not found");

    const speciesData = {
      scientific_name: data.name,
      common_name: data.common_names?.[0]?.common_name || "",
      category: data.category,
      description: data.taxonomy?.habitats?.[0]?.habitat_description || "",
      image: data.picture_url || "",
      status: data.category,
      iucn_id: data.taxonid,
    };

    const saved = await Species.findOneAndUpdate(
      { iucn_id: iucnId },
      speciesData,
      { new: true, upsert: true }
    );

    return saved;
  } catch (error) {
    console.error("Error fetching species by ID:", error.message);
    throw new Error("Failed to fetch species");
  }
};