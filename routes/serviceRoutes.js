const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");

// ==========================
// GET ALL SERVICES (PUBLIC)
// ==========================

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM services ORDER BY created_at DESC",
        (err, results) => {

            if (err) {
                console.error(err);
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});

// ==========================
// GET SINGLE SERVICE
// ==========================

router.get("/:id", (req, res) => {

    db.query(
        "SELECT * FROM services WHERE id = ?",
        [req.params.id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Service not found"
                });
            }

            res.json(results[0]);

        }
    );

});

// ==========================
// CREATE SERVICE
// ==========================

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            title,
            slug,
            short_description,
            description,
            icon,
            image,
            status
        } = req.body;

        const sql = `
        INSERT INTO services
        (
            title,
            slug,
            short_description,
            description,
            icon,
            image,
            status
        )
        VALUES (?,?,?,?,?,?,?)
        `;

        db.query(
            sql,
            [
                title,
                slug,
                short_description,
                description,
                icon,
                image,
                status
            ],
            (err) => {

                if (err) {
                    console.error(err);
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Service created successfully"
                });

            }
        );

    }
);

// ========================================
// GET SINGLE SERVICE
// ========================================

router.get("/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        "SELECT * FROM services WHERE id = ?",
        [id],
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
                    message: "Service not found."
                });
            }

            res.json(results[0]);

        }
    );

});

// ==========================
// UPDATE SERVICE
// ==========================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            title,
            slug,
            short_description,
            description,
            icon,
            image,
            status
        } = req.body;

        const sql = `
        UPDATE services SET
            title=?,
            slug=?,
            short_description=?,
            description=?,
            icon=?,
            image=?,
            status=?
        WHERE id=?
        `;

        db.query(
            sql,
            [
                title,
                slug,
                short_description,
                description,
                icon,
                image,
                status,
                req.params.id
            ],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Service updated successfully"
                });

            }
        );

    }
);

// ========================================
// UPDATE SERVICE
// ========================================

router.put("/:id", verifyToken, verifyAdmin, (req, res) => {

    const { id } = req.params;

    const {
        title,
        slug,
        short_description,
        description,
        icon,
        image,
        status
    } = req.body;

    db.query(
        `UPDATE services
         SET title = ?,
             slug = ?,
             short_description = ?,
             description = ?,
             icon = ?,
             image = ?,
             status = ?
         WHERE id = ?`,
        [
            title,
            slug,
            short_description,
            description,
            icon,
            image,
            status,
            id
        ],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                message: "Service updated successfully."
            });

        }
    );

});

// ==========================
// DELETE SERVICE
// ==========================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        db.query(
            "DELETE FROM services WHERE id = ?",
            [req.params.id],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Service deleted successfully"
                });

            }
        );

    }
);

// ========================================
// DELETE SERVICE
// ========================================

router.delete("/:id", verifyToken, verifyAdmin, (req, res) => {

    const { id } = req.params;

    db.query(
        "DELETE FROM services WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: "Service not found."
                });
            }

            res.json({
                success: true,
                message: "Service deleted successfully."
            });

        }
    );

});

module.exports = router;