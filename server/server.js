import express from "express";
import cors from "cors";
import records from "./records/records.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

const PORT = process.env.PORT || 5050;
const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:5173',
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use("/", records);

// Start the Express server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
