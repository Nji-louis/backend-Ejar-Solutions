const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "..", "uploads");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif"
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },

    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${ext}`;
        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    },
    fileFilter: (req, file, cb) => {
        if (allowedTypes.has(file.mimetype)) {
            return cb(null, true);
        }

        cb(new Error("Only JPEG, PNG, WebP, and GIF images are allowed."));
    }
});

router.get("/test", (req, res) => {
    res.json({
        success: true,
        message: "Local upload route working"
    });
});

router.post("/", (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (err) {
            const status = err instanceof multer.MulterError ? 400 : 400;
            return res.status(status).json({
                success: false,
                message: err.message || "Image upload failed."
            });
        }

        next();
    });
}, (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No image selected."
        });
    }

    res.json({
        success: true,
        message: "Image uploaded successfully.",
        imageUrl: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
