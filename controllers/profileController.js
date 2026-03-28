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

    if (req.body.degrees) {
      const degrees = JSON.parse(req.body.degrees);
      await db.query("DELETE FROM degrees WHERE user_id = ?", [userId]);
      for (let d of degrees) {
        await db.query(
          "INSERT INTO degrees (user_id, degree_name, institution, degree_url, completion_date) VALUES (?, ?, ?, ?, ?)",
          [
            userId,
            d.degree_name,
            d.institution,
            d.degree_url,
            d.completion_date,
          ],
        );
      }
    }

    if (req.body.licences) {
      const licences = JSON.parse(req.body.licences);
      await db.query("DELETE FROM licences WHERE user_id = ?", [userId]);
      for (let l of licences) {
        await db.query(
          "INSERT INTO licences (user_id, licence_name, licence_url, completion_date) VALUES (?, ?, ?, ?)",
          [userId, l.licence_name, l.licence_url, l.completion_date],
        );
      }
    }

    if (req.body.courses) {
      const courses = JSON.parse(req.body.courses);
      await db.query("DELETE FROM professional_courses WHERE user_id = ?", [
        userId,
      ]);
      for (let c of courses) {
        await db.query(
          "INSERT INTO professional_courses (user_id, course_name, course_url, completion_date) VALUES (?, ?, ?, ?)",
          [userId, c.course_name, c.course_url, c.completion_date],
        );
      }
    }

    if (req.body.employment) {
      const employment = JSON.parse(req.body.employment);
      await db.query("DELETE FROM employment_history WHERE user_id = ?", [
        userId,
      ]);
      for (let e of employment) {
        await db.query(
          "INSERT INTO employment_history (user_id, company_name, role_title, start_date, end_date) VALUES (?, ?, ?, ?, ?)",
          [userId, e.company_name, e.role_title, e.start_date, e.end_date],
        );
      }
    }

    res.status(200).json({ message: "Profile and image saved successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error saving profile." });
  }
};
