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
      const { name, email, role } = req.body;

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

      db.query(
        "SELECT id FROM users WHERE email = ? LIMIT 1",
        [email],
        async (err, results) => {
          if (err) {
            console.error("Check User Error:", err);
            return res.status(500).json({
              success: false,
              message: "Database error."
            });
          }

          if (results.length > 0) {
            return res.status(409).json({
              success: false,
              message: "A user with this email already exists."
            });
          }

          const inviteToken =
            crypto.randomBytes(32).toString("hex");

          const inviteExpires =
            new Date(Date.now() + 24 * 60 * 60 * 1000);

          const temporaryPassword =
            crypto.randomBytes(32).toString("hex");

          const hashedTemporaryPassword =
            await bcrypt.hash(temporaryPassword, 10);

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
              name,
              email,
              hashedTemporaryPassword,
              role,
              "pending",
              inviteToken,
              inviteExpires,
              0
            ],
            async (insertErr, result) => {
              if (insertErr) {
                console.error("Create Invite Error:", insertErr);
                return res.status(500).json({
                  success: false,
                  message: "Unable to create invitation."
                });
              }

              const inviteLink =
                `https://ejar-solutions.onrender.com/admin/accept-invite.html?token=${inviteToken}`;

              const emailResult = await sendEmail(
                "You're invited to EJAR SOLUTIONS",
                `Hello ${name},

You have been invited to join the EJAR SOLUTIONS dashboard as an ${role}.

Click the link below to activate your account and create your password:

${inviteLink}

This invitation expires in 24 hours.

Best regards,
EJAR SOLUTIONS`,
                email
              );

              if (!emailResult.success) {
                console.error("Invitation email failed:", emailResult);

                return res.status(500).json({
                  success: false,
                  message: "User was created, but invitation email failed."
                });
              }

              return res.status(201).json({
                success: true,
                message: "Invitation sent successfully.",
                user: {
                  id: result.insertId,
                  name,
                  email,
                  role,
                  status: "pending"
                }
              });
            }
          );
        }
      );

    } catch (error) {
      console.error("Invite User Error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to invite user."
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