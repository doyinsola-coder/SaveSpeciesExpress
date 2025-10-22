import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    userId: { type: String},
    speciesName: { type: String, required: true },
    amount: { type: Number, required: true },
    reference: { type: String },
    status: { type: String, default: "pending" },
    message: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
