const express = require("express");
const router = express.Router();

const db = require("../config/db");

// ======================
// SUBSCRIBE
// ======================

router.post("/", (req, res) => {

    const { email } = req.body;

    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required."
        });
    }

    db.query(
        "SELECT * FROM newsletter_subscribers WHERE email = ?",
        [email],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length > 0) {
                return res.json({
                    success: false,
                    message: "Email already subscribed."
                });
            }

            db.query(
                "INSERT INTO newsletter_subscribers (email) VALUES (?)",
                [email],
                (err) => {

                    if (err) {
                        return res.status(500).json(err);
                    }

                    res.json({
                        success: true,
                        message: "Subscribed successfully."
                    });

                }
            );

        }
    );

});

module.exports = router;