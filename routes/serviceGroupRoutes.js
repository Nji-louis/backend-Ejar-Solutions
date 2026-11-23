const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");

// PUBLIC: GET ACTIVE SERVICE GROUPS
router.get("/public", (req, res) => {
    const sql = `
        SELECT id, name, slug, description, display_order
        FROM service_groups
        WHERE status = 'active'
        ORDER BY display_order ASC, id ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get public service groups error:", err);
            return res.status(500).json({
                message: "Failed to retrieve service groups."
            });
        }

        res.json(results);
    });
});

// GET ALL SERVICE GROUPS
router.get("/", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "SELECT * FROM service_groups ORDER BY display_order ASC, id ASC",
        (err, results) => {
            if (err) {
                console.error("Get service groups error:", err);
                return res.status(500).json({
                    message: "Failed to retrieve service groups."
                });
            }

            res.json(results);
        }
    );
});

// GET ONE SERVICE GROUP
router.get("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "SELECT * FROM service_groups WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) {
                console.error("Get service group error:", err);
                return res.status(500).json({
                    message: "Failed to retrieve service group."
                });
            }

            if (!results.length) {
                return res.status(404).json({
                    message: "Service group not found."
                });
            }

            res.json(results[0]);
        }
    );
});

// CREATE SERVICE GROUP
router.post("/", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        name,
        slug,
        description,
        display_order,
        status
    } = req.body;

    if (!name || !slug) {
        return res.status(400).json({
            message: "Group name and slug are required."
        });
    }

    const sql = `
        INSERT INTO service_groups
        (name, slug, description, display_order, status)
        VALUES (?, ?, ?, ?, ?)
    `;

    const values = [
        name.trim(),
        slug.trim().toLowerCase(),
        description || null,
        Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
        status === "inactive" ? "inactive" : "active"
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "A service group with this slug already exists."
                });
            }

            console.error("Create service group error:", err);
            return res.status(500).json({
                message: "Failed to create service group."
            });
        }

        res.status(201).json({
            message: "Service group created successfully.",
            id: result.insertId
        });
    });
});

// UPDATE SERVICE GROUP
router.put("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        name,
        slug,
        description,
        display_order,
        status
    } = req.body;

    if (!name || !slug) {
        return res.status(400).json({
            message: "Group name and slug are required."
        });
    }

    const sql = `
        UPDATE service_groups
        SET name = ?,
            slug = ?,
            description = ?,
            display_order = ?,
            status = ?
        WHERE id = ?
    `;

    const values = [
        name.trim(),
        slug.trim().toLowerCase(),
        description || null,
        Number.isInteger(Number(display_order)) ? Number(display_order) : 0,
        status === "inactive" ? "inactive" : "active",
        req.params.id
    ];

    db.query(sql, values, (err, result) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "A service group with this slug already exists."
                });
            }

            console.error("Update service group error:", err);
            return res.status(500).json({
                message: "Failed to update service group."
            });
        }

        if (!result.affectedRows) {
            return res.status(404).json({
                message: "Service group not found."
            });
        }

        res.json({
            message: "Service group updated successfully."
        });
    });
});

// DELETE SERVICE GROUP
router.delete("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "SELECT COUNT(*) AS total FROM service_categories WHERE group_id = ?",
        [req.params.id],
        (err, results) => {
            if (err) {
                console.error("Check service group categories error:", err);
                return res.status(500).json({
                    message: "Unable to check assigned categories."
                });
            }

            if (Number(results[0].total) > 0) {
                return res.status(409).json({
                    message: "This group still has categories assigned. Reassign those categories before deleting the group."
                });
            }

            db.query(
                "DELETE FROM service_groups WHERE id = ?",
                [req.params.id],
                (deleteErr, result) => {
                    if (deleteErr) {
                        console.error("Delete service group error:", deleteErr);
                        return res.status(500).json({
                            message: "Failed to delete service group."
                        });
                    }

                    if (!result.affectedRows) {
                        return res.status(404).json({
                            message: "Service group not found."
                        });
                    }

                    res.json({
                        message: "Service group deleted successfully."
                    });
                }
            );
        }
    );
});

module.exports = router;
