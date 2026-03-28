const db = require("../config/db");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const [profiles] = await db.query(
      "SELECT * FROM profiles WHERE user_id = ?",
      [userId],
    );
    const [degrees] = await db.query(
      "SELECT * FROM degrees WHERE user_id = ?",
      [userId],
    );

    const [certifications] = await db.query(
      "SELECT * FROM certifications WHERE user_id = ?",
      [userId],
    );
    const [licences] = await db.query(
      "SELECT * FROM licences WHERE user_id = ?",
      [userId],
    );
    const [courses] = await db.query(
      "SELECT * FROM professional_courses WHERE user_id = ?",
      [userId],
    );
    const [employment] = await db.query(
      "SELECT * FROM employment_history WHERE user_id = ?",
      [userId],
    );

    if (profiles.length === 0) {
      return res
        .status(200)
        .json({ message: "No profile found.", profile: null });
    }

    res.status(200).json({
      message: "Profile retrieved successfully",
      profile: profiles[0],
      degrees,
      certifications,
      licences,
      courses,
      employment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching profile." });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { first_name, last_name, bio, linkedin_url } = req.body;

    let profile_image_url = null;
    if (req.file) {
      profile_image_url = `/uploads/${req.file.filename}`;
    }

    const [existing] = await db.query(
      "SELECT id FROM profiles WHERE user_id = ?",
      [userId],
    );

    if (existing.length > 0) {
      if (profile_image_url) {
        await db.query(
          "UPDATE profiles SET first_name=?, last_name=?, bio=?, linkedin_url=?, profile_image_url=? WHERE user_id=?",
          [first_name, last_name, bio, linkedin_url, profile_image_url, userId],
        );
      } else {
        await db.query(
          "UPDATE profiles SET first_name=?, last_name=?, bio=?, linkedin_url=? WHERE user_id=?",
          [first_name, last_name, bio, linkedin_url, userId],
        );
      }
    } else {
      await db.query(
        "INSERT INTO profiles (user_id, first_name, last_name, bio, linkedin_url, profile_image_url) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, first_name, last_name, bio, linkedin_url, profile_image_url],
      );
    }

    if (req.body.certifications) {
      const certs = JSON.parse(req.body.certifications);
      await db.query("DELETE FROM certifications WHERE user_id = ?", [userId]);
      for (let c of certs) {
        await db.query(
          "INSERT INTO certifications (user_id, cert_name, cert_url, completion_date) VALUES (?, ?, ?, ?)",
          [userId, c.cert_name, c.cert_url, c.completion_date],
        );
      }
    }

    res.status(200).json({ message: "Profile and image saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error saving profile." });
  }
};
