const db = require("../config/db");
const dateUtils = require("../utils/dateUtils");

exports.placeBid = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bid_amount } = req.body;

    if (!bid_amount || bid_amount <= 0) {
      return res
        .status(400)
        .json({ error: "Please enter a valid bid amount." });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [winResults] = await db.query(
      `SELECT COUNT(*) as winCount FROM bids 
             WHERE user_id = ? AND status = 'won' 
             AND MONTH(target_date) = ? AND YEAR(target_date) = ?`,
      [userId, currentMonth, currentYear],
    );

    if (winResults[0].winCount >= 3) {
      return res.status(403).json({
        error:
          "Monthly limit reached. You can only be the Alumni of the Day 3 times per calendar month.",
      });
    }

    // const tomorrow = new Date();
    // tomorrow.setDate(tomorrow.getDate() + 1);
    // const targetDate = tomorrow.toISOString().split("T")[0];
    // // 1. Calculate tomorrow's date strictly in UK local time
    // const targetDate = dayjs().tz().add(1, "day").format("YYYY-MM-DD");
    // 1. Calculate tomorrow's date using our clean utility
    const targetDate = dateUtils.getTomorrow();
    const [existingBids] = await db.query(
      "SELECT * FROM bids WHERE user_id = ? AND target_date = ?",
      [userId, targetDate],
    );

    if (existingBids.length > 0) {
      const currentBid = existingBids[0];

      if (bid_amount <= currentBid.bid_amount) {
        return res.status(400).json({
          error: `You already bid £${currentBid.bid_amount}. You can only increase your bid.`,
        });
      }

      await db.query("UPDATE bids SET bid_amount = ? WHERE id = ?", [
        bid_amount,
        currentBid.id,
      ]);
      return res.status(200).json({ message: "Bid increased successfully!" });
    } else {
      await db.query(
        "INSERT INTO bids (user_id, bid_amount, target_date) VALUES (?, ?, ?)",
        [userId, bid_amount, targetDate],
      );
      return res.status(201).json({ message: "Bid placed successfully!" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error placing bid." });
  }
};

exports.triggerWinnerSelection = async (req, res) => {
  try {
    // const today = new Date().toISOString().split("T")[0];
    // const today = dayjs().tz().format("YYYY-MM-DD");
    // Get today's date using our clean utility
    const today = dateUtils.getToday();
    const [bids] = await db.query(
      "SELECT id FROM bids WHERE target_date = ? ORDER BY bid_amount DESC LIMIT 1",
      [today],
    );

    if (bids.length > 0) {
      await db.query('UPDATE bids SET status = "won" WHERE id = ?', [
        bids[0].id,
      ]);
      await db.query(
        'UPDATE bids SET status = "lost" WHERE target_date = ? AND id != ?',
        [today, bids[0].id],
      );
      res.status(200).json({
        message: "Manual trigger successful! Winner selected for today.",
      });
    } else {
      res.status(200).json({
        message: "Manual trigger successful, but no bids found for today.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Manual trigger failed." });
  }
};

exports.getAlumnusOfDay = async (req, res) => {
  try {
    // const today = new Date().toISOString().split("T")[0];
    // const today = dayjs().tz().format("YYYY-MM-DD");
    // Get today's date using our clean utility
    const today = dateUtils.getToday();
    const [winners] = await db.query(
      `
            SELECT p.first_name, p.last_name, p.bio, p.linkedin_url, p.profile_image_url 
            FROM bids b
            JOIN profiles p ON b.user_id = p.user_id
            WHERE b.target_date = ? AND b.status = 'won'
        `,
      [today],
    );

    if (winners.length === 0) {
      return res
        .status(404)
        .json({ message: "No Alumni Influencer featured today." });
    }

    res.status(200).json({
      message: "Today's Featured Alumni",
      alumnus: winners[0],
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error fetching Alumnus of the Day." });
  }
};

exports.getMyBids = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [bids] = await db.query(
      "SELECT id, bid_amount, target_date, status, created_at FROM bids WHERE user_id = ? ORDER BY target_date DESC",
      [userId],
    );

    res.status(200).json({
      message: "Your bidding history",
      total_bids: bids.length,
      bids: bids,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching bid history." });
  }
};
