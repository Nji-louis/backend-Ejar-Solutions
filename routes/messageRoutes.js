const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/sendEmail");

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const verifyEditorOrAdmin =require("../middleware/editorMiddleware");



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

    // Email to EJAR

    await sendEmail(

        `New Contact Form Message: ${subject}`,

        `
Name: ${name}

Email: ${email}

Phone: ${phone}

Subject: ${subject}

Message:
${message}
        `

    );

    // Email to customer

    await sendEmail(

        "Thank you for contacting EJAR SOLUTIONS",

        `
Hello ${name},

Thank you for contacting EJAR SOLUTIONS.

We have received your message and a member of our team will contact you shortly.

Subject:
${subject}

Message:
${message}

Best regards,

EJAR SOLUTIONS
Business Support Services
        `,

        email

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
    verifyEditorOrAdmin,
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
    verifyEditorOrAdmin,
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
    verifyEditorOrAdmin,
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
// REPLY TO MESSAGE
// ADMIN ONLY
// =========================

router.post(
    "/:id/reply",
    verifyToken,
    verifyEditorOrAdmin,
    async (req, res) => {

        const { subject, message } = req.body;

        db.query(

            "SELECT * FROM messages WHERE id=?",

            [req.params.id],

            async (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (results.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Message not found."
                    });

                }

                const customer = results[0];

                try {

                    // Send reply email to customer

                    await sendEmail(

                        subject,

                        `
Hello ${customer.name},

${message}

Best regards,

EJAR SOLUTIONS
Business Support Services
                        `,

                        customer.email

                    );

                    // Update message status

                    db.query(

                        "UPDATE messages SET status='replied' WHERE id=?",

                        [req.params.id],

                        (updateErr) => {

                            if (updateErr) {
                                return res.status(500).json(updateErr);
                            }

                            res.json({
                                success: true,
                                message: "Reply sent successfully."
                            });

                        }

                    );

                }

                catch (emailError) {

                    console.error(emailError);

                    res.status(500).json({
                        success: false,
                        message: "Failed to send reply email."
                    });

                }

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
    verifyEditorOrAdmin,
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

module.exports = router;// nodemon reload test
// nodemon reload test
