const db = require("../config/db");

module.exports = async (req, res, next) => {
  const apiKey = req.header("x-api-key");

  if (!apiKey) {
    return res
      .status(401)
      .json({ error: "Access denied. No API key provided." });
  }

  try {
    const [keys] = await db.query(
      "SELECT id, is_revoked FROM api_keys WHERE api_key = ?",
      [apiKey],
    );

    if (keys.length === 0 || keys[0].is_revoked) {
      return res.status(401).json({ error: "Invalid or revoked API key." });
    }

    const keyId = keys[0].id;

    const endpoint = req.originalUrl;
    const ip = req.ip || req.connection.remoteAddress;

    await db.query(
      "INSERT INTO api_usage_logs (api_key_id, endpoint_accessed, ip_address) VALUES (?, ?, ?)",
      [keyId, endpoint, ip],
    );

    next();
  } catch (error) {
    console.error("API Key Middleware Error:", error);
    res.status(500).json({ error: "Server error validating API key." });
  }
};
