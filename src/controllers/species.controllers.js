import axios from "axios";
// Assuming you have this model path:
import Species from "../models/species.js"; 
import dotenv, { configDotenv } from "dotenv";

// Load environment variables
configDotenv();

// --- Configuration ---
const IUCN_TOKEN = process.env.IUCN_TOKEN;
// Ensure your BASE_URL is correct for v4:
const IUCN_BASE_URL = "https://apiv4.iucnredlist.org"; 

// Axios configuration with the Bearer Token for v4
const AXIOS_CONFIG = {
    headers: {
        // v4 uses a Bearer token in the Authorization header
        'Authorization': `Bearer ${IUCN_TOKEN}`, 
        'Accept': 'application/json'
    }
};

if (!IUCN_TOKEN) {
    console.error("❌ IUCN_TOKEN environment variable is not set.");
    // In a real application, you might exit or throw here.
}


// --- Helper Function: Get All Categories for the main fetching logic ---

/**
 * Fetches a list of all available Red List Category codes (e.g., 'EX', 'CR', 'LC').
 * @returns {Promise<string[]>} An array of category codes.
 */
const getAllCategories = async () => {
    const url = `${IUCN_BASE_URL}/api/v4/red_list_categories/`;
    try {
        const response = await axios.get(url, AXIOS_CONFIG);
        // Assuming the response structure for categories lists codes under 'result'
        return response.data?.result?.map(category => category.code) || [];
    } catch (error) {
        console.error('❌ Error fetching Red List Categories:', error.message);
        return []; 
    }
}


// --- Refactored Main Fetch Function with Pagination ---

/**
 * 🌍 Fetches all species from the IUCN API V4 by category and pagination.
 * This function will be slow due to the massive number of requests required.
 * @param {string} [category] - Optional category to filter by (e.g., 'VU', 'EN').
 * @returns {Promise<object[]>} An array of species data.
 */
export const getAllSpecies = async (category) => {
    try {
        // Check local DB first (EXISTING CACHING LOGIC IS FINE)
        const filter = category ? { category: category.toUpperCase() } : {};
        const cachedSpecies = await Species.find(filter).sort({
            scientific_name: 1,
        });

        if (cachedSpecies.length > 0) {
            console.log(`📦 Returning cached species (${cachedSpecies.length}) from database`);
            return cachedSpecies;
        }

        // --- IUCN V4 FETCHING LOGIC START ---
        console.log("🌍 Initiating full fetch from IUCN V4 API (may take a long time)...");

        // 1. Determine which categories to fetch
        let codesToFetch = [];
        if (category) {
            codesToFetch = [category.toUpperCase()];
        } else {
            codesToFetch = await getAllCategories();
            if (codesToFetch.length === 0) {
                 throw new Error("Could not retrieve Red List Categories for full fetch.");
            }
        }
        
        let allSpeciesData = [];

        // 2. Iterate through determined categories and paginate
        for (const code of codesToFetch) {
            let currentPage = 1;
            let hasMore = true;
            console.log(`\n  -> Starting pagination for category: ${code}`);

            while (hasMore) {
                const url = `${IUCN_BASE_URL}/api/v4/red_list_categories/${code}`;
                const params = {
                    page: currentPage,
                    per_page: 100, // Max page size for v4
                    latest: true   
                };
                               //https://api.iucnredlist.org/api/v4/red_list_categories/
                try {
                    const response = await axios.get(url, { ...AXIOS_CONFIG, params });
                    // The 'result' property holds the array of assessments in v4
                    const speciesBatch = response.data?.result || [];

                    if (speciesBatch.length > 0) {
                        // Map and process the batch
                        const mappedBatch = speciesBatch.map((item) => ({
                            scientific_name: item.scientific_name || "Unknown",
                            common_name: item.main_common_name || "",
                            category: item.category || "NOT_EVALUATED",
                            status: item.category || "Unknown",
                            iucn_id: item.taxonid,
                            image: "https://via.placeholder.com/300",
                            description: "No description available",
                        }));

                        allSpeciesData.push(...mappedBatch);
                        // Log progress (crucial for long-running fetches)
                        console.log(`     Page ${currentPage} fetched. Total: ${allSpeciesData.length}`);
                        currentPage++;
                    } else {
                        // Empty result means we've hit the end of the data for this category
                        hasMore = false;
                        console.log(`  -> Finished fetching category: ${code}`);
                    }

                } catch (error) {
                    console.error(`❌ Error fetching page ${currentPage} for ${code}:`, error.message);
                    hasMore = false; // Stop on error
                }
            }
        }

        // 3. Cache the results to the database (EXISTING CACHING LOGIC IS FINE)
        if (allSpeciesData.length > 0) {
            // Using insertMany with { ordered: false } to ignore duplicate key errors
            await Species.insertMany(allSpeciesData, { ordered: false }).catch(() => {});
            console.log(`✅ Cached ${allSpeciesData.length} species from IUCN`);
        }

        return allSpeciesData;

    } catch (error) {
        console.error("❌ Fatal Error fetching all species:", error.message);
        throw new Error("Failed to fetch species from database or IUCN API");
    }
};

// --- REST OF YOUR ORIGINAL CODE (Assumed to be correct for v4 structure) ---

// ✅ Fetch species by name (with caching)
export const getSpeciesByName = async (speciesName) => {
    try {
      if (!IUCN_TOKEN) {
        throw new Error("IUCN_TOKEN not configured");
      }
  
      // NOTE: The /advanced_search?name= endpoint might be an unofficial or v3 endpoint.
      // For official v4, you'd use /api/v4/taxa/scientific_name/{scientific_name}
      // Assuming your advanced search endpoint works as intended:
      const response = await axios.get(
        `${IUCN_BASE_URL}/advanced_search?name=${encodeURIComponent(
          speciesName
        )}&token=${IUCN_TOKEN}` // The token in the query param is not needed if using the header
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
        category: data.category || "NOT_EVALUATED",
        description: data.taxonomy?.habitats?.[0]?.habitat_description || "",
        image: data.picture_url || "https://via.placeholder.com/300",
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


// ✅ Fetch species by IUCN ID
export const getSpeciesById = async (iucnId) => {
    try {
      if (!IUCN_TOKEN) {
        throw new Error("IUCN_TOKEN not configured");
      }
  
      // NOTE: This /id/ endpoint might be an unofficial or v3 endpoint. 
      // The v4 documentation does not explicitly list a simple ID lookup.
      // Assuming your ID lookup endpoint works as intended:
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
        image: data.picture_url || "https://via.placeholder.com/300",
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