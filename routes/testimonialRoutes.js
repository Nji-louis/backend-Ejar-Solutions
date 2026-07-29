const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

// ==========================
// GET ALL TESTIMONIALS
// ==========================

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM testimonials ORDER BY created_at DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

// ==========================
// GET SINGLE TESTIMONIAL
// ==========================

router.get("/:id", (req, res) => {

    db.query(
        "SELECT * FROM testimonials WHERE id=?",
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "Testimonial not found"
                });

            }

            res.json(results[0]);

        }
    );

});

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