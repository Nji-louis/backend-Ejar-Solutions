const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");

// ==========================
// GET ALL TESTIMONIALS
// ==========================
router.get("/public", (req, res) => {

    db.query(

        "SELECT * FROM testimonials WHERE status='active' ORDER BY id ASC",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results);

        }

    );

});


// ==========================
// GET ALL TESTIMONIALS
// ADMIN ONLY
// ==========================

router.get(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(
            "SELECT * FROM testimonials ORDER BY id ASC",
            (err, results) => {

                if (err) {
                    console.error("Testimonials Admin Error:", err);
                    return res.status(500).json(err);
                }

                res.json(results);

            }
        );

    }
);


// ==========================
// GET SINGLE TESTIMONIAL
// ADMIN ONLY
// ==========================

router.get(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(
            "SELECT * FROM testimonials WHERE id = ? LIMIT 1",
            [req.params.id],
            (err, results) => {

                if (err) {
                    console.error("Get Testimonial Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error"
                    });
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Testimonial not found"
                    });
                }

                res.json(results[0]);

            }
        );

    }
);


// ==========================
// CREATE TESTIMONIAL
// ==========================

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            name,
            company,
            position,
            testimonial,
            image,
            rating,
            status
        } = req.body;

        db.query(

            `INSERT INTO testimonials
            (
                name,
                company,
                position,
                testimonial,
                image,
                rating,
                status
            )
            VALUES (?,?,?,?,?,?,?)`,

            [
                name,
                company,
                position,
                testimonial,
                image,
                rating,
                status
            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Testimonial added successfully."
                });

            }

        );

    }

);

// ==========================
// UPDATE TESTIMONIAL
// ==========================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            name,
            company,
            position,
            testimonial,
            image,
            rating,
            status
        } = req.body;

        db.query(

            `UPDATE testimonials
             SET
                name=?,
                company=?,
                position=?,
                testimonial=?,
                image=?,
                rating=?,
                status=?
             WHERE id=?`,

            [
                name,
                company,
                position,
                testimonial,
                image,
                rating,
                status,
                req.params.id
            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Testimonial updated successfully."
                });

            }

        );

    }

);

// ==========================
// DELETE TESTIMONIAL
// ==========================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(
            "DELETE FROM testimonials WHERE id=?",
            [req.params.id],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Testimonial deleted successfully."
                });

            }
        );

    }

);

module.exports = router;