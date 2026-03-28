const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xssSanitizer = require("./middleware/xssSanitizer");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./swagger.json");

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

app.use(xssSanitizer);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    error: "Too many requests from this IP, please try again in 15 minutes.",
  },
});

app.use("/api/", limiter);

require("./jobs/winnerSelection");

const db = require("./config/db");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const profileRoutes = require("./routes/profileRoutes");
app.use("/api/profile", profileRoutes);

const biddingRoutes = require("./routes/biddingRoutes");
app.use("/api/bids", biddingRoutes);

app.use("/uploads", express.static("uploads"));

const apiKeyRoutes = require("./routes/apiKeyRoutes");
app.use("/api/developer/keys", apiKeyRoutes);

app.get("/api/test", async (req, res) => {
  try {
    const [rows] = await db.query('SELECT "Database is connected!" AS message');
    res.json({
      api_status: "Working!",
      db_status: rows[0].message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Database connection failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
