
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");

// PUBLIC: GET HOMEPAGE SERVICE CATEGORIES
router.get("/public", (req, res) => {
    const sql = `
        SELECT id, name, slug, description, display_order
        FROM service_categories
        WHERE status = 'active'
          AND show_on_homepage = 1
        ORDER BY display_order ASC, id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get public service categories error:", err);
            return res.status(500).json({
                message: "Failed to retrieve service categories."
            });
        }

        res.json(results);
    });
});

// GET ALL SERVICE CATEGORIES
router.get("/", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const sql = `
        SELECT *
        FROM service_categories
        ORDER BY display_order ASC, id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get service categories error:", err);
            return res.status(500).json({
                message: "Failed to retrieve service categories."
            });
        }

        res.json(results);
    });
});

// GET ONE SERVICE CATEGORY
router.get("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "SELECT * FROM service_categories WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) {
                console.error("Get service category error:", err);
                return res.status(500).json({
                    message: "Failed to retrieve service category."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Service category not found."
                });
            }

            res.json(results[0]);
        }
    );
});

// CREATE SERVICE CATEGORY
router.post("/", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        name,
        slug,
        description,
        display_order,
        show_on_homepage,
        status
    } = req.body;

    if (!name || !slug) {
        return res.status(400).json({
            message: "Category name and slug are required."
        });
    }

    const sql = `
        INSERT INTO service_categories
        (name, slug, description, display_order, show_on_homepage, status)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    const values = [
        name.trim(),
        slug.trim(),
        description || null,
        Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
        show_on_homepage === false || show_on_homepage === 0 ? 0 : 1,
        status === "inactive" ? "inactive" : "active"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "A category with this slug already exists."
                });
            }

            console.error("Create service category error:", err);
            return res.status(500).json({
                message: "Failed to create service category."
            });
        }

        res.status(201).json({
            message: "Service category created successfully.",
            id: result.insertId
        });
    });
});

// UPDATE SERVICE CATEGORY
router.put("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        name,
        slug,
        description,
        display_order,
        show_on_homepage,
        status
    } = req.body;

    if (!name || !slug) {
        return res.status(400).json({
            message: "Category name and slug are required."
        });
    }

    const sql = `
        UPDATE service_categories
        SET name = ?,
            slug = ?,
            description = ?,
            display_order = ?,
            show_on_homepage = ?,
            status = ?
        WHERE id = ?
    `;

    const values = [
        name.trim(),
        slug.trim(),
        description || null,
        Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
        show_on_homepage === false || show_on_homepage === 0 ? 0 : 1,
        status === "inactive" ? "inactive" : "active",
        req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "A category with this slug already exists."
                });
            }

            console.error("Update service category error:", err);
            return res.status(500).json({
                message: "Failed to update service category."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service category not found."
            });
        }

        res.json({
            message: "Service category updated successfully."
        });
    });
});

// DELETE SERVICE CATEGORY
router.delete("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "DELETE FROM service_categories WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                console.error("Delete service category error:", err);
                return res.status(500).json({
                    message: "Failed to delete service category."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Service category not found."
                });
            }

            res.json({
                message: "Service category deleted successfully. Existing services have been preserved."
            });
        }
    );
});

module.exports = router;
