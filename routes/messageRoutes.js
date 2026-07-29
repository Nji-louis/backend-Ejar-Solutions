const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

const db = require("../config/db");


// =========================
// EMAIL TEST ROUTE
// =========================

router.get("/email-test", async (req, res) => {

    try {

        await sendEmail(
            "Backend Test Email",
            "If you receive this email, Nodemailer is working correctly."
        );

        res.json({
            success: true,
            message: "Test email sent successfully"
        });

    } catch (err) {

        console.error("Email Test Error:", err);

        res.status(500).json(err);

    }

});


// =========================
// SEND MESSAGE
// =========================

router.post("/", async (req, res) => {

    const {
    name,
    email,
    phone,
    subject,
    message
} = req.body;

    const sql =
`INSERT INTO messages
(name, email, phone, subject, message)
VALUES (?, ?, ?, ?, ?)`;

    db.query(
        sql,
        [
    name,
    email,
    phone,
    subject,
    message
],
        async (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            try {

                await sendEmail(
                    `New Contact Form Message: ${subject}`,
                    `
Name: ${name}

Email: ${email}

Subject: ${subject}

Message:
${message}
                    `
                );

            } catch (emailError) {

                console.error("Email Error:", emailError);

            }

            res.json({
                success: true,
                message: "Message Sent Successfully"
            });

        }
    );
});


// =========================
// GET ALL MESSAGES
// ADMIN ONLY
// =========================

router.get(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(
            "SELECT * FROM messages ORDER BY created_at DESC",
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);

// =========================
// GET SINGLE MESSAGE
// ADMIN ONLY
// =========================

router.get(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(
            "SELECT * FROM messages WHERE id=?",
            [req.params.id],
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (results.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Message not found."
                    });

                }

                res.json(results[0]);

            }
        );

    }
);

// =========================
// UPDATE MESSAGE STATUS
// ADMIN ONLY
// =========================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const { status } = req.body;

        db.query(

            "UPDATE messages SET status=? WHERE id=?",

            [
                status,
                req.params.id
            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Message updated successfully"
                });

            }

        );

    }
);

// =========================
// DELETE MESSAGE
// ADMIN ONLY
// =========================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(

            "DELETE FROM messages WHERE id=?",

            [req.params.id],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Message deleted successfully"
                });

            }

        );

    }
);


// =========================
// TEST ROUTE
// =========================

router.get("/test", (req, res) => {

    res.json({
        success: true,
        message: "Messages route working"
    });

});

module.exports = router;