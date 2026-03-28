const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    if (!email.endsWith("@eastminster.ac.uk")) {
      return res.status(400).json({
        error:
          "Registration requires a valid university email domain (@eastminster.ac.uk).",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email],
    );
    if (existingUsers.length > 0) {
      return res
        .status(400)
        .json({ error: "This email is already registered." });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const [result] = await db.query(
      "INSERT INTO users (email, password_hash, verification_token) VALUES (?, ?, ?)",
      [email, hashedPassword, verificationToken],
    );

    res.status(201).json({
      message: "Registration successful! Please verify your email.",
      userId: result.insertId,
      verification_link: `http://localhost:3000/api/auth/verify/${verificationToken}`,
    });

    res.status(201).json({
      message: "Registration successful!",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (users.length === 0) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const user = users[0];

    if (!user.is_verified) {
      return res
        .status(403)
        .json({ error: "Please verify your email before logging in." });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.status(200).json({
      message: "Login successful!",
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login." });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const [users] = await db.query(
      "SELECT id FROM users WHERE verification_token = ?",
      [token],
    );

    if (users.length === 0) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token." });
    }

    const userId = users[0].id;

    await db.query(
      "UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = ?",
      [userId],
    );

    res
      .status(200)
      .json({ message: "Email verified successfully! You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during verification." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await db.query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res.status(200).json({
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    const userId = users[0].id;

    const resetToken = crypto.randomBytes(32).toString("hex");

    const expireTime = new Date();
    expireTime.setHours(expireTime.getHours() + 1);

    await db.query(
      "UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?",
      [resetToken, userId],
    );

    res.status(200).json({
      message: "If that email is registered, a reset link has been sent.",
      reset_link: `http://localhost:3000/api/auth/reset-password/${resetToken}`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Server error during password reset request." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { new_password } = req.body;

    if (!new_password || new_password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long." });
    }

    const [users] = await db.query(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token],
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    const userId = users[0].id;

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(new_password, saltRounds);

    await db.query(
      "UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashedPassword, userId],
    );

    res.status(200).json({
      message: "Password has been successfully reset. You can now log in.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during password reset." });
  }
};

exports.logout = (req, res) => {
  res.status(200).json({
    message:
      "Successfully logged out. Please remove the token from your client.",
  });
};
