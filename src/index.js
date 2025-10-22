import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import speciesRoutes from "./routes/species.routes.js";
import pledgeRoutes from "./routes/pledge.routes.js";
import userRoutes from "./routes/users.routes.js";
import reportRoutes from "./routes/report.routes.js";
import donationRoutes from "./routes/donation.routes.js";
import paystackRoutes from "./routes/paystackRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/pledges", pledgeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/paystack", paystackRoutes);


// Default route
app.get("/", (req, res) => res.send("🌍 SaveSpecies Backend Running"));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
