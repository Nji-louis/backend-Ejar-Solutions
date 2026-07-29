const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");

// =========================
// CREATE uploads FOLDER
// =========================

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// =========================
// MULTER STORAGE
// =========================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, uploadDir);

    },

    filename: (req, file, cb) => {

        const filename =
            Date.now() + "-" + file.originalname;

        cb(null, filename);

    }

});

const upload = multer({
    storage
});

// =========================
// TEST ROUTE
// =========================

router.get("/test", (req, res) => {

    res.json({

        success: true,
        message: "Upload route working"

    });

});

// =========================
// UPLOAD IMAGE
// =========================

router.post(
    "/",
    upload.single("image"),
    (req, res) => {

        if (!req.file) {

            return res.status(400).json({

                success: false,
                message: "No image selected."

            });

        }

        res.json({

            success: true,

            message: "Image uploaded successfully.",

            imageUrl: "/uploads/" + req.file.filename

        });

    }
);

module.exports = router;