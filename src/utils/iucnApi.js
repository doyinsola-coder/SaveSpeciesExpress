import axios from "axios";

const BASE_URL = "https://api.iucnredlist.org/api/v4/";
const TOKEN = process.env.IUCN_API_TOKEN; // add this in your .env file

const apiClient = axios.create({
  baseURL: BASE_URL,
});

apiClient.interceptors.request.use((config) => {
  const token = TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchSpeciesByCategory = async (category) => {
  try {
    const res = await apiClient.get(`species/category/${category}`);
    return res.data.result;
  } catch (error) {
    console.error("Error fetching from IUCN:", error.message);
    return [];
  }
};

export const fetchPossiblyExtinctInTheWild = async () => {
  try {
    const res = await apiClient.get(`taxa/possibly_extinct_in_the_wild`);
    return res.data.result;
  } catch (error) {
    console.error("Error fetching from IUCN:", error.message);
    return [];
  }
};
