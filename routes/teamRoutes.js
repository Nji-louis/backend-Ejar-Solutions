const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");


// =====================================================
// PUBLIC — GET ACTIVE TEAM MEMBERS
// =====================================================

router.get("/public", (req, res) => {

    db.query(
        `SELECT
            id,
            name,
            role,
            department,
            description,
            image,
            skills,
            phone,
            email,
            sort_order
         FROM team
         WHERE status = 'active'
         ORDER BY sort_order ASC, id ASC`,
        (err, results) => {

            if (err) {

                console.error("Public Team Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to load team members."
                });

            }

            res.json(results);

        }
    );

});


// =====================================================
// ADMIN / EDITOR — GET ALL TEAM MEMBERS
// =====================================================

router.get(
    "/",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        db.query(
            `SELECT *
             FROM team
             ORDER BY sort_order ASC, id ASC`,
            (err, results) => {

                if (err) {

                    console.error("Admin Team Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to load team members."
                    });

                }

                res.json(results);

            }
        );

    }
);


// =====================================================
// ADMIN / EDITOR — GET SINGLE TEAM MEMBER
// =====================================================

router.get(
    "/:id",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        db.query(
            `SELECT *
             FROM team
             WHERE id = ?
             LIMIT 1`,
            [req.params.id],
            (err, results) => {

                if (err) {

                    console.error("Get Team Member Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Database error."
                    });

                }

                if (results.length === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Team member not found."
                    });

                }

                res.json(results[0]);

            }
        );

    }
);


// =====================================================
// ADMIN / EDITOR — CREATE TEAM MEMBER
// =====================================================

router.post(
    "/",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        const {
            name,
            role,
            department,
            description,
            image,
            skills,
            phone,
            email,
            sort_order,
            status
        } = req.body;


        if (!name || !role || !description) {

            return res.status(400).json({
                success: false,
                message: "Name, role and description are required."
            });

        }


        db.query(
            `INSERT INTO team
            (
                name,
                role,
                department,
                description,
                image,
                skills,
                phone,
                email,
                sort_order,
                status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name,
                role,
                department || null,
                description,
                image || null,
                skills
                    ? JSON.stringify(skills)
                    : JSON.stringify([]),
                phone || null,
                email || null,
                Number.isInteger(Number(sort_order))
                    ? Number(sort_order)
                    : 0,
                status === "inactive"
                    ? "inactive"
                    : "active"
            ],
            (err, result) => {

                if (err) {

                    console.error("Create Team Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to create team member."
                    });

                }

                res.json({
                    success: true,
                    message: "Team member created successfully.",
                    id: result.insertId
                });

            }
        );

    }
);


// =====================================================
// ADMIN / EDITOR — UPDATE TEAM MEMBER
// =====================================================

router.put(
    "/:id",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        const {
            name,
            role,
            department,
            description,
            image,
            skills,
            phone,
            email,
            sort_order,
            status
        } = req.body;


        if (!name || !role || !description) {

            return res.status(400).json({
                success: false,
                message: "Name, role and description are required."
            });

        }


        db.query(
            `UPDATE team
             SET
                name = ?,
                role = ?,
                department = ?,
                description = ?,
                image = ?,
                skills = ?,
                phone = ?,
                email = ?,
                sort_order = ?,
                status = ?
             WHERE id = ?`,
            [
                name,
                role,
                department || null,
                description,
                image || null,
                skills
                    ? JSON.stringify(skills)
                    : JSON.stringify([]),
                phone || null,
                email || null,
                Number.isInteger(Number(sort_order))
                    ? Number(sort_order)
                    : 0,
                status === "inactive"
                    ? "inactive"
                    : "active",
                req.params.id
            ],
            (err, result) => {

                if (err) {

                    console.error("Update Team Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to update team member."
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Team member not found."
                    });

                }


                res.json({
                    success: true,
                    message: "Team member updated successfully."
                });

            }
        );

    }
);


// =====================================================
// ADMIN / EDITOR — DELETE TEAM MEMBER
// =====================================================

router.delete(
    "/:id",
    verifyToken,
    verifyEditorOrAdmin,
    (req, res) => {

        db.query(
            `DELETE FROM team
             WHERE id = ?`,
            [req.params.id],
            (err, result) => {

                if (err) {

                    console.error("Delete Team Error:", err);

                    return res.status(500).json({
                        success: false,
                        message: "Unable to delete team member."
                    });

                }


                if (result.affectedRows === 0) {

                    return res.status(404).json({
                        success: false,
                        message: "Team member not found."
                    });

                }


                res.json({
                    success: true,
                    message: "Team member deleted successfully."
                });

            }
        );

    }
);


module.exports = router;