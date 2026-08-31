const express = require("express");
const router = express.Router();

const db = require("../config/db");

const sendEmail = require("../utils/sendEmail");

const verifyToken = require("../middleware/authMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");

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


// ======================
// GET ALL SUBSCRIBERS
// ADMIN / EDITOR ONLY
// ======================

router.get(
    "/",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        db.query(
            "SELECT * FROM newsletter_subscribers ORDER BY created_at DESC",
            (err, results) => {

                if (err) {

                    console.error(
                        "Newsletter Subscribers Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to load subscribers."
                    });

                }

                res.json(results);

            }
        );

    }
);


// ======================
// SEND NEWSLETTER
// ADMIN / EDITOR ONLY
// ======================

router.post(
    "/send",
    verifyToken,
    verifyEditorOrAdmin,
    async (req, res) => {

        const { subject, message } = req.body;

        if (!subject || !message) {

            return res.status(400).json({
                success: false,
                message: "Subject and message are required."
            });

        }

        db.query(
            "SELECT email FROM newsletter_subscribers ORDER BY created_at ASC",
            async (err, subscribers) => {

                if (err) {

                    console.error(
                        "Newsletter Subscribers Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to load subscribers."
                    });

                }

                if (subscribers.length === 0) {

                    return res.status(400).json({
                        success: false,
                        message: "There are no newsletter subscribers."
                    });

                }

                let sent = 0;
                let failed = 0;

                for (const subscriber of subscribers) {

                    const result = await sendEmail(
                        subject,
                        message,
                        subscriber.email
                    );

                    if (result && result.success) {

                        sent++;

                    } else {

                        failed++;

                    }

                }

                res.json({
                    success: true,
                    message: "Newsletter sending completed.",
                    total: subscribers.length,
                    sent,
                    failed
                });

            }
        );

    }
);


// ======================
// DELETE SUBSCRIBER
// ADMIN / EDITOR ONLY
// ======================

router.delete(
    "/:id",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        db.query(
            "DELETE FROM newsletter_subscribers WHERE id = ?",
            [req.params.id],
            (err, result) => {

                if (err) {

                    console.error(
                        "Newsletter Delete Error:",
                        err
                    );

                    return res.status(500).json({
                        success: false,
                        message: "Unable to delete subscriber."
                    });

                }

                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Subscriber not found."
                    });

                }

                res.json({
                    success: true,
                    message: "Subscriber deleted successfully."
                });

            }
        );

    }
);

module.exports = router;