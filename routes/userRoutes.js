const express = require("express");

const router = express.Router();

const db = require("../config/db");

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