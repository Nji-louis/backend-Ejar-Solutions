
const express = require("express");
const router = express.Router();

const db = require("../config/db");
const verifyToken = require("../middleware/authMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");

// PUBLIC: GET ACTIVE SERVICES
router.get("/public", (req, res) => {
    const sql = `
        SELECT
            s.*,
            c.name AS category_name,
            c.slug AS category_slug,
            c.group_id AS group_id
        FROM services s
        INNER JOIN service_categories c
            ON s.category_id = c.id
        WHERE s.status = 'active'
          AND c.status = 'active'
        ORDER BY c.display_order ASC, s.created_at DESC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Get public services error:", err);
            return res.status(500).json({
                message: "Failed to retrieve public services."
            });
        }

        res.json(results);
    });
});

// GET ALL SERVICES
router.get("/", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
       `
    SELECT
        s.*,
        c.name AS category_name,
        c.group_id AS group_id,
        g.name AS group_name
    FROM services s
    LEFT JOIN service_categories c
        ON s.category_id = c.id
    LEFT JOIN service_groups g
        ON c.group_id = g.id
    ORDER BY s.created_at DESC
`,
        (err, results) => {
            if (err) {
                console.error("Get services error:", err);
                return res.status(500).json({
                    message: "Failed to retrieve services."
                });
            }

            res.json(results);
        }
    );
});

// GET ONE SERVICE
router.get("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const { id } = req.params;

    db.query(
        "SELECT * FROM services WHERE id = ?",
        [id],
        (err, results) => {
            if (err) {
                console.error("Get service error:", err);
                return res.status(500).json({
                    message: "Failed to retrieve service."
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Service not found."
                });
            }

            res.json(results[0]);
        }
    );
});

// CREATE SERVICE
router.post("/", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        title,
        slug,
        short_description,
        description,
        icon,
        image,
        read_more_url,
        category_id,
        status
    } = req.body;

    if (!title || !slug) {
        return res.status(400).json({
            message: "Title and slug are required."
        });
    }

    const sql = `
    INSERT INTO services
    (
        title,
        slug,
        short_description,
        description,
        icon,
        image,
        read_more_url,
        category_id,
        status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`;
    
    const values = [
    title,
    slug,
    short_description || null,
    description || null,
    icon || null,
    image || null,
    read_more_url || null,
    category_id ? Number(category_id) : null,
    status === "inactive" ? "inactive" : "active"
];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Create service error:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "A service with this slug already exists."
                });
            }

            return res.status(500).json({
                message: "Failed to create service."
            });
        }

        res.status(201).json({
            message: "Service created successfully.",
            id: result.insertId
        });
    });
});

// UPDATE SERVICE
router.put("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const { id } = req.params;

    const {
        title,
        slug,
        short_description,
        description,
        icon,
        image,
        read_more_url,
        category_id,
        status
    } = req.body;

    if (!title || !slug) {
        return res.status(400).json({
            message: "Title and slug are required."
        });
    }

    const sql = `
    UPDATE services
    SET
        title = ?,
        slug = ?,
        short_description = ?,
        description = ?,
        icon = ?,
        image = ?,
        read_more_url = ?,
        category_id = ?,
        status = ?
    WHERE id = ?
`;

    const values = [
    title,
    slug,
    short_description || null,
    description || null,
    icon || null,
    image || null,
    read_more_url || null,
    category_id ? Number(category_id) : null,
    status === "inactive" ? "inactive" : "active",
    id
];

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error("Update service error:", err);

            if (err.code === "ER_DUP_ENTRY") {
                return res.status(409).json({
                    message: "A service with this slug already exists."
                });
            }

            return res.status(500).json({
                message: "Failed to update service."
            });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Service not found or no changes were made."
            });
        }

        res.json({
            message: "Service updated successfully."
        });
    });
});

// DELETE SERVICE
router.delete("/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const { id } = req.params;

    db.query(
        "DELETE FROM services WHERE id = ?",
        [id],
        (err, result) => {
            if (err) {
                console.error("Delete service error:", err);
                return res.status(500).json({
                    message: "Failed to delete service."
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Service not found."
                });
            }

            res.json({
                message: "Service deleted successfully."
            });
        }
    );
});

module.exports = router;
