import axios from "axios";
import Pledge from "../models/pledge.js";

const IUCN_TOKEN = process.env.IUCN_TOKEN;

export const createPledge = async (userName, speciesName) => {
  try {
    // Call the IUCN Red List API using axios
    const response = await axios.get(
      `https://apiv3.iucnredlist.org/api/v3/species/${encodeURIComponent(speciesName)}?token=${IUCN_TOKEN}`
    );

    const data = response.data;
    const speciesId = data?.result?.[0]?.taxonid || null;

    // Save pledge to MongoDB
    const pledge = await Pledge.create({
      userName,
      speciesName,
      speciesId,
    });

    return pledge;
  } catch (error) {
    console.error("Error fetching species or saving pledge:", error.message);
    throw new Error("Failed to create pledge");
  }
};
