const express = require("express");

const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");

const verifyAdmin = require("../middleware/adminMiddleware");

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Admin route is working"
    });
});

// ==========================
// ADMIN DASHBOARD STATS
// ==========================

router.get(
  "/dashboard",
  verifyToken,
  verifyAdmin,
  async (req, res) => {

    try {

      db.query(
  `
  SELECT
    (SELECT COUNT(*) FROM users) AS totalUsers,
    (SELECT COUNT(*) FROM messages) AS totalMessages,
    (SELECT COUNT(*) FROM messages WHERE status='new') AS newMessages
  `,
        (err, stats) => {

          if (err) {
    console.error("Dashboard SQL Error:", err);
    return res.status(500).json({
        message: err.message
    });
}

          db.query(
            "SELECT id,name,email,created_at FROM users ORDER BY created_at DESC LIMIT 5",
            (err, users) => {

             if (err) {
    console.error("Dashboard SQL Error:", err);
    return res.status(500).json({
        message: err.message
    });
}

              db.query(
                "SELECT * FROM messages ORDER BY created_at DESC LIMIT 5",
                (err, messages) => {

                 if (err) {
    console.error("Dashboard SQL Error:", err);
    return res.status(500).json({
        message: err.message
    });
}

                  res.json({
                    stats: stats[0],
                    recentUsers: users,
                    recentMessages: messages
                  });

                }
              );

            }
          );

        }
      );

    } catch (error) {

    console.error(error);

    res.status(500).json({
        message: error.message
    });

}

  }
);

module.exports = router;