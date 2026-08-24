const express = require("express");
const router = express.Router();
const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");

// ========================================
// GET ALL IMAGES
// ========================================

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM gallery ORDER BY id DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json(results);

        }
    );

});

// ========================================
// GET SINGLE IMAGE
// ========================================

router.get("/:id", (req, res) => {

    db.query(
        "SELECT * FROM gallery WHERE id=?",
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Image not found."
                });

            }

            res.json(results[0]);

        }
    );

});

// ========================================
// CREATE IMAGE
// ========================================

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            title,
            image,
            category,
            description
        } = req.body;

        db.query(

            `
            INSERT INTO gallery
            (title,image,category,description)
            VALUES (?,?,?,?)
            `,

            [
                title,
                image,
                category,
                description
            ],

            (err) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });

                }

                res.json({
                    success: true,
                    message: "Gallery image created successfully"
                });

            }

        );

    }

);

// ========================================
// UPDATE IMAGE
// ========================================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            title,
            image,
            category,
            description
        } = req.body;

        db.query(

            `
            UPDATE gallery
            SET
            title=?,
            image=?,
            category=?,
            description=?
            WHERE id=?
            `,

            [
                title,
                image,
                category,
                description,
                req.params.id
            ],

            (err) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });

                }

                res.json({
                    success: true,
                    message: "Gallery updated successfully"
                });

            }

        );

    }

);

// ========================================
// DELETE IMAGE
// ========================================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(

            "DELETE FROM gallery WHERE id=?",

            [req.params.id],

            (err) => {

                if (err) {

                    return res.status(500).json({
                        success: false,
                        message: err.message
                    });

                }

                res.json({
                    success: true,
                    message: "Gallery image deleted successfully"
                });

            }

        );

    }

);

module.exports = router;