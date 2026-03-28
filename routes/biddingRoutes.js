const express = require("express");
const apiKeyAuth = require("../middleware/apiKeyAuth");
const router = express.Router();
const biddingController = require("../controllers/biddingController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/place", authMiddleware, biddingController.placeBid);

router.get("/test-winner", biddingController.triggerWinnerSelection);

router.get(
  "/alumnus-of-the-day",
  apiKeyAuth,
  biddingController.getAlumnusOfDay,
);

router.get("/my-bids", authMiddleware, biddingController.getMyBids);

module.exports = router;
