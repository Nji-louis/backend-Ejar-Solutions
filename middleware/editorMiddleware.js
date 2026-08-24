const db = require("../config/db");

const verifyEditorOrAdmin = (req, res, next) => {

    const userId = req.user.id;

    db.query(
        "SELECT id, role FROM users WHERE id = ?",
        [userId],
        (err, results) => {

            if (err) {
                console.error("Role Check Error:", err);

                return res.status(500).json({
                    success: false,
                    message: "Database error"
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: "User not found"
                });
            }

            const role = results[0].role;

            if (!["admin", "editor"].includes(role)) {
                return res.status(403).json({
                    success: false,
                    message: "Access denied"
                });
            }

            next();

        }
    );

};

module.exports = verifyEditorOrAdmin;