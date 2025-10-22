import mongoose from "mongoose";

const pledgeSchema = new mongoose.Schema(
  {
    userName: { type: String, required: true },
    speciesName: { type: String, required: true },
    speciesId: { type: String },
  },
  { timestamps: true } 
);

export default mongoose.model("Pledge", pledgeSchema);
