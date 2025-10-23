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

// ✅ CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://save-species.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("🚫 CORS blocked for origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // required if frontend uses withCredentials
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// ✅ Apply CORS before everything else
app.use(cors(corsOptions));

// ✅ Explicitly handle preflight requests globally
// app.options("/.*/", cors(corsOptions));

// ✅ Parse JSON before routes
app.use(express.json());

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB error:", err));

// ✅ Routes
app.use("/api/users", userRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/pledges", pledgeRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/paystack", paystackRoutes);

// ✅ Root route
app.get("/", (req, res) => res.send("🌍 SaveSpecies Backend Running"));

// ✅ Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
