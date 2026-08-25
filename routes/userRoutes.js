const express = require("express");

const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const sendEmail = require("../utils/sendEmail");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");


// ==========================
// GET USER PROFILE
// ==========================

router.get(
  "/profile",
  verifyToken,
  (req, res) => {

    const userId = req.user.id;

    db.query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [userId],
      (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        res.json(results[0]);

      }
    );

  }
);



router.get(
  "/",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    db.query(
      "SELECT id,name,email,role,created_at FROM users",
      (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json(results);

      }
    );

  }
);
               


          

// =====================================
// GET SINGLE USER
// =====================================

router.get(
  "/:id",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    db.query(

      "SELECT id, name, email, role FROM users WHERE id = ?",

      [req.params.id],

      (err, results) => {

        if (err) {
          return res.status(500).json(err);
        }

        if (results.length === 0) {
          return res.status(404).json({
            message: "User not found"
          });
        }

        res.json(results[0]);

      }

    );

  }
);




// =====================================
// INVITE USER
// ADMIN ONLY
// =====================================

router.post(
  "/",
  verifyToken,
  verifyAdmin,
  async (req, res) => {

    try {

      const {
        name,
        email,
        role
      } = req.body;

      // -------------------------
      // VALIDATION
      // -------------------------

      if (!name || !email || !role) {

        return res.status(400).json({
          success: false,
          message: "Name, email and role are required."
        });

      }

      if (!["admin", "editor"].includes(role)) {

        return res.status(400).json({
          success: false,
          message: "Invalid user role."
        });

      }

      const cleanEmail =
        email.trim().toLowerCase();

      // -------------------------
      // CHECK EXISTING USER
      // -------------------------

      db.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [cleanEmail],
        async (err, results) => {

          if (err) {

            console.error(
              "Check User Error:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Database error."
            });

          }

          if (results.length > 0) {

            return res.status(409).json({
              success: false,
              message:
                "A user with this email already exists."
            });

          }

          try {

            // -------------------------
            // CREATE SECURE TOKEN
            // -------------------------

            const rawToken =
              crypto
                .randomBytes(32)
                .toString("hex");

            const hashedToken =
              crypto
                .createHash("sha256")
                .update(rawToken)
                .digest("hex");

            // Invitation valid for 24 hours

            const inviteExpires =
              new Date(
                Date.now() +
                24 * 60 * 60 * 1000
              );

            /*
              Password is NOT NULL in your table.

              We therefore create a random unusable
              temporary password hash.

              The invited user never receives or
              knows this password.

              It will be replaced when they accept
              the invitation.
            */

            const temporaryPassword =
              crypto
                .randomBytes(32)
                .toString("hex");

            const temporaryPasswordHash =
              await bcrypt.hash(
                temporaryPassword,
                10
              );

            // -------------------------
            // INSERT PENDING USER
            // -------------------------

            db.query(
              `
              INSERT INTO users
              (
                name,
                email,
                password,
                role,
                status,
                invite_token,
                invite_expires,
                email_verified
              )
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
              `,
              [
                name.trim(),
                cleanEmail,
                temporaryPasswordHash,
                role,
                "pending",
                hashedToken,
                inviteExpires,
                0
              ],
              async (insertErr, result) => {

                if (insertErr) {

                  console.error(
                    "Invite User Insert Error:",
                    insertErr
                  );

                  return res
                    .status(500)
                    .json({
                      success: false,
                      message:
                        "Unable to create invitation."
                    });

                }

                // -------------------------
                // BUILD INVITATION LINK
                // -------------------------

                const frontendUrl =
                  process.env.FRONTEND_URL ||
                  "https://ejar-solutions.onrender.com";

                const inviteLink =
                  `${frontendUrl}/admin/accept-invite.html?token=${rawToken}`;

                // -------------------------
                // SEND EMAIL
                // -------------------------

                const subject =
                  "You have been invited to EJAR SOLUTIONS";

                const emailText =
`Hello ${name},

You have been invited to join the EJAR SOLUTIONS dashboard as an ${role}.

To activate your account and create your password, open the link below:

${inviteLink}

This invitation expires in 24 hours.

If you were not expecting this invitation, you can ignore this email.

Best regards,

EJAR SOLUTIONS`;

                const emailResult =
                  await sendEmail(
                    subject,
                    emailText,
                    cleanEmail
                  );

                // -------------------------
                // RESPONSE
                // -------------------------

                res.status(201).json({
                  success: true,
                  message:
                    "User invitation created and email sent.",
                  user: {
                    id: result.insertId,
                    name: name.trim(),
                    email: cleanEmail,
                    role,
                    status: "pending"
                  }
                });

              }
            );

          } catch (error) {

            console.error(
              "Invitation Error:",
              error
            );

            return res
              .status(500)
              .json({
                success: false,
                message:
                  "Unable to create invitation."
              });

          }

        }
      );

    } catch (error) {

      console.error(
        "Invite User Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to invite user."
      });

    }

  }
);

// =====================================
// UPDATE USER
// =====================================

router.put(
  "/:id",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    const {

      name,
      email,
      role

    } = req.body;

    db.query(

      `UPDATE users
       SET
       name = ?,
       email = ?,
       role = ?
       WHERE id = ?`,

      [

        name,
        email,
        role,
        req.params.id

      ],

      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({

          success: true,
          message: "User updated successfully"

        });

      }

    );

  }
);

// =====================================
// DELETE USER
// =====================================

router.delete(
  "/:id",
  verifyToken,
  verifyAdmin,
  (req, res) => {

    db.query(

      "DELETE FROM users WHERE id = ?",

      [req.params.id],

      (err) => {

        if (err) {
          return res.status(500).json(err);
        }

        res.json({

          success: true,
          message: "User deleted successfully"

        });

      }

    );

  }
);

module.exports = router;