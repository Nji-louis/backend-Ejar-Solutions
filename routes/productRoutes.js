const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");


// =========================
// GET ALL PRODUCTS
// =========================

router.get("/", (req, res) => {

    db.query(
        "SELECT * FROM products",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);

        }
    );

});


// =========================
// GET SINGLE PRODUCT
// =========================

router.get("/:id", (req, res) => {

    const { id } = req.params;

    db.query(
        "SELECT * FROM products WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results[0]);

        }
    );

});


// =========================
// CREATE PRODUCT (ADMIN ONLY)
// =========================

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const {
            name,
            description,
            price,
            image,
            category
        } = req.body;

        const sql =
            "INSERT INTO products (name, description, price, image, category) VALUES (?, ?, ?, ?, ?)";

        db.query(
            sql,
            [name, description, price, image, category],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Product Added Successfully"
                });

            }
        );

    }
);


// =========================
// UPDATE PRODUCT (ADMIN ONLY)
// =========================

router.put(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const { id } = req.params;

        const {
            name,
            description,
            price,
            image,
            category
        } = req.body;

        const sql =
            "UPDATE products SET name=?, description=?, price=?, image=?, category=? WHERE id=?";

        db.query(
            sql,
            [name, description, price, image, category, id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Product Updated Successfully"
                });

            }
        );

    }
);


// =========================
// DELETE PRODUCT (ADMIN ONLY)
// =========================

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    (req, res) => {

        const { id } = req.params;

        db.query(
            "DELETE FROM products WHERE id = ?",
            [id],
            (err, result) => {

                if (err) {
                    return res.status(500).json(err);
                }

                res.json({
                    success: true,
                    message: "Product Deleted Successfully"
                });

            }
        );

    }
);

module.exports = router;