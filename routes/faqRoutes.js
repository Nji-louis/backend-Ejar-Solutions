const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

// ========================================
// GET ALL FAQS
// ========================================

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM faqs ORDER BY sort_order ASC, created_at DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }

    );

});

// ========================================
// GET SINGLE FAQ
// ========================================

router.get("/:id", (req, res) => {

    db.query(

        "SELECT * FROM faqs WHERE id=?",

        [req.params.id],

        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "FAQ not found"
                });

            }

            res.json(results[0]);

        }

    );

});

// ========================================
// CREATE FAQ
// ========================================

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {

            question,
            answer,
            sort_order,
            status

        } = req.body;

        db.query(

            `INSERT INTO faqs
            (
                question,
                answer,
                sort_order,
                status
            )
            VALUES (?,?,?,?)`,

            [

                question,
                answer,
                sort_order,
                status

            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({

                    success: true,
                    message: "FAQ created successfully."

                });

            }

        );

    }

);

// ========================================
// UPDATE FAQ
// ========================================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {

            question,
            answer,
            sort_order,
            status

        } = req.body;

        db.query(

            `UPDATE faqs
             SET
                question=?,
                answer=?,
                sort_order=?,
                status=?
             WHERE id=?`,

            [

                question,
                answer,
                sort_order,
                status,
                req.params.id

            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({

                    success: true,
                    message: "FAQ updated successfully."

                });

            }

        );

    }

);

// ========================================
// DELETE FAQ
// ========================================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(

            "DELETE FROM faqs WHERE id=?",

            [req.params.id],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({

                    success: true,
                    message: "FAQ deleted successfully."

                });

            }

        );

    }

);

module.exports = router;