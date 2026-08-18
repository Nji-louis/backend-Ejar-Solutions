const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");



// ========================================
// GET PUBLIC WEBSITE SETTINGS
// ========================================

router.get("/public", (req, res) => {

    db.query(
        `SELECT
            company_name,
            address,
            phone,
            email,
            website,
            facebook,
            linkedin,
            instagram,
            youtube,
            logo
         FROM settings
         WHERE id = 1
         LIMIT 1`,
        (err, results) => {

            if (err) {
                console.error("Public Settings Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Unable to load website settings."
                });
            }

            if (results.length === 0) {

                return res.status(404).json({
                    success: false,
                    message: "Website settings not found."
                });

            }

            res.json({
                success: true,
                settings: results[0]
            });

        }
    );

});


// ========================================
// GET WEBSITE SETTINGS
// ========================================

router.get(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {
        console.log("GET /api/settings called");

        db.query(
            "SELECT * FROM settings LIMIT 1",
            (err, results) => {

                if (err) {
                    return res.status(500).json(err);
                }

                if (results.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Settings not found."
                    });
                }

                res.json(results[0]);

            }
        );

    }
);

// ========================================
// UPDATE WEBSITE SETTINGS
// ========================================

router.put(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {

            company_name,
            address,
            phone,
            email,
            website,
            facebook,
            linkedin,
            instagram,
            youtube,
            logo

        } = req.body;

        const sql = `
            UPDATE settings
            SET
                company_name = ?,
                address = ?,
                phone = ?,
                email = ?,
                website = ?,
                facebook = ?,
                linkedin = ?,
                instagram = ?,
                youtube = ?,
                logo = ?
            WHERE id = 1
        `;

        db.query(
            sql,
            [
                company_name,
                address,
                phone,
                email,
                website,
                facebook,
                linkedin,
                instagram,
                youtube,
                logo
            ],
            (err) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Settings updated successfully."
                });

            }
        );

    }
);

module.exports = router;