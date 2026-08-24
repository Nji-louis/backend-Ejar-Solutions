const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin =require("../middleware/adminMiddleware");
const verifyEditorOrAdmin =require("../middleware/editorMiddleware");

// ==========================
// GET ALL BLOG POSTS
// ==========================

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM blogs ORDER BY created_at DESC",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

// ==========================
// GET SINGLE BLOG
// ==========================

router.get("/:id", (req, res) => {

    db.query(
        "SELECT * FROM blogs WHERE id=?",
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {

                return res.status(404).json({
                    message: "Blog not found"
                });

            }

            res.json(results[0]);

        }

    );

});

// ==========================
// CREATE BLOG
// ==========================

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {

            title,
            slug,
            category,
            excerpt,
            content,
            image,
            author,
            meta_title,
            meta_description,
            status

        } = req.body;

        db.query(

            `INSERT INTO blogs
            (
                title,
                slug,
                category,
                excerpt,
                content,
                image,
                author,
                meta_title,
                meta_description,
                status
            )
            VALUES (?,?,?,?,?,?,?,?,?,?)`,

            [
                title,
                slug,
                category,
                excerpt,
                content,
                image,
                author,
                meta_title,
                meta_description,
                status
            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({

                    success: true,
                    message: "Blog created successfully."

                });

            }

        );

    }

);

// ==========================
// UPDATE BLOG
// ==========================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {

            title,
            slug,
            category,
            excerpt,
            content,
            image,
            author,
            meta_title,
            meta_description,
            status

        } = req.body;

        db.query(

            `UPDATE blogs
             SET
                title=?,
                slug=?,
                category=?,
                excerpt=?,
                content=?,
                image=?,
                author=?,
                meta_title=?,
                meta_description=?,
                status=?
             WHERE id=?`,

            [

                title,
                slug,
                category,
                excerpt,
                content,
                image,
                author,
                meta_title,
                meta_description,
                status,
                req.params.id

            ],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({

                    success: true,
                    message: "Blog updated successfully."

                });

            }

        );

    }

);

// ==========================
// DELETE BLOG
// ==========================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(

            "DELETE FROM blogs WHERE id=?",

            [req.params.id],

            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({

                    success: true,
                    message: "Blog deleted successfully."

                });

            }

        );

    }

);

module.exports = router;