const db = require("../config/db");
const crypto = require("crypto");

exports.generateKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { app_name } = req.body;

    if (!app_name) {
      return res
        .status(400)
        .json({ error: "Please provide an app_name for this key." });
    }

    const apiKey = crypto.randomBytes(32).toString("hex");

    await db.query(
      "INSERT INTO api_keys (user_id, api_key, app_name) VALUES (?, ?, ?)",
      [userId, apiKey, app_name],
    );

    res.status(201).json({
      message:
        "API Key generated successfully. Please copy it now, you will not be able to see it again!",
      api_key: apiKey,
      app_name: app_name,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error generating API key." });
  }
};

exports.listKeys = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [keys] = await db.query(
      "SELECT id, app_name, is_revoked, created_at FROM api_keys WHERE user_id = ?",
      [userId],
    );

    res.status(200).json({ keys });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error listing API keys." });
  }
};

exports.revokeKey = async (req, res) => {
  try {
    const userId = req.user.userId;
    const keyId = req.params.id;

    const [result] = await db.query(
      "UPDATE api_keys SET is_revoked = TRUE WHERE id = ? AND user_id = ?",
      [keyId, userId],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Key not found or you do not have permission." });
    }

    res.status(200).json({ message: "API Key successfully revoked." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error revoking API key." });
  }
};

exports.getKeyStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [stats] = await db.query(
      `
            SELECT ak.app_name, COUNT(aul.id) as usage_count, MAX(aul.access_time) as last_used
            FROM api_keys ak
            LEFT JOIN api_usage_logs aul ON ak.id = aul.api_key_id
            WHERE ak.user_id = ?
            GROUP BY ak.id
        `,
      [userId],
    );

    res.status(200).json({ statistics: stats });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching statistics." });
  }
};
