import express from "express";
import axios from "axios";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import dotenv from "dotenv";
import winston from "winston";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5123;
const HOST = "0.0.0.0"; // Makes server accessible externally

// ✅ Local Development Server Running via Ngrok
const LOCAL_SERVER_URL = process.env.LOCAL_SERVER_URL || "http://localhost:3000"; // Replace with your ngrok URL

// ✅ Logger Configuration with Winston
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [new winston.transports.Console()],
});

// ✅ Middleware
app.use(express.json({ limit: "5mb" })); // Handles large payloads
app.use(cors());
app.use(morgan("combined"));
app.use(helmet()); // Security headers
app.use(compression()); // Enables gzip compression

// ✅ Webhook Endpoint (Handles Create/Delete Opportunities)
app.post("/webhook/opportunity", async (req, res) => {
  try {
    const event = req.body;

    logger.info(`🔹 Webhook Event Received: ${JSON.stringify(event)}`);

    // ✅ Forward to Local Development Server via Ngrok
    const response = await axios.post(`${LOCAL_SERVER_URL}/api/opportunity`, event, {
      headers: { "Content-Type": "application/json" },
    });

    logger.info(`✅ Forwarded to Local Server. Response: ${JSON.stringify(response.data)}`);
    res.status(200).json({ message: "Event received & forwarded successfully!" });
  } catch (error) {
    logger.error(`❌ Error forwarding event: ${error.message}`);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// ✅ Start the Express Server on 0.0.0.0:5123
app.listen(PORT, HOST, () => {
  logger.info(`🚀 Webhook Proxy Server Running on http://${HOST}:${PORT}`);
});
