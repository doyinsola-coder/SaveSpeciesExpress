import mongoose from "mongoose";

const speciesSchema = new mongoose.Schema({
  taxonid: Number,
  scientific_name: String,
  category: String,
  population_trend: String,
  kingdom_name: String,
  class_name: String,
  order_name: String,
  family_name: String,
});

export default mongoose.model("Species", speciesSchema);
