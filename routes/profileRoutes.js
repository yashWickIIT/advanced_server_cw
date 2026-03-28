const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(
      null,
      req.user.userId + "-" + Date.now() + path.extname(file.originalname),
    );
  },
});
const upload = multer({ storage: storage });

router.get("/", authMiddleware, profileController.getProfile);

router.post(
  "/",
  authMiddleware,
  upload.single("profile_image"),
  profileController.saveProfile,
);

module.exports = router;
