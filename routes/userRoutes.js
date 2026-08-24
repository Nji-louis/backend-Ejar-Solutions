const express = require("express");

const router = express.Router();

const db = require("../config/db");
const bcrypt = require("bcryptjs");

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
// CREATE USER
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
        password,
        role
      } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({
          success: false,
          message: "Name, email, password and role are required."
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

          const hashedPassword =
            await bcrypt.hash(password, 10);

          db.query(
            `INSERT INTO users
            (name, email, password, role)
            VALUES (?, ?, ?, ?)`,
            [
              name,
              email,
              hashedPassword,
              role
            ],
            (err, result) => {

              if (err) {
                console.error("Create User Error:", err);

                return res.status(500).json({
                  success: false,
                  message: "Unable to create user."
                });
              }

              res.status(201).json({
                success: true,
                message: "User created successfully.",
                user: {
                  id: result.insertId,
                  name,
                  email,
                  role
                }
              });

            }
          );

        }
      );

    } catch (error) {

      console.error("Create User Error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to create user."
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