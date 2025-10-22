import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    speciesName: {
      type: String,
      required: true,
    },
    issueType: {
      type: String,
      enum: ["Overhunting", "Deforestation", "Pollution", "Climate Change", "Other"],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String, // optional URL if you later support uploads
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Resolved"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
