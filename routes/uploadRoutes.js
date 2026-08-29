const express = require("express");
const router = express.Router();

const multer = require("multer");
const cloudinary = require("../config/cloudinary");

// =========================
// MULTER MEMORY STORAGE
// =========================

const storage = multer.memoryStorage();

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
    async (req, res) => {

        try {

            if (!req.file) {

                return res.status(400).json({

                    success: false,
                    message: "No image selected."

                });

            }

            const result = await new Promise((resolve, reject) => {

                const stream =
                    cloudinary.uploader.upload_stream(
                        {
                            folder: "ejar-solutions"
                        },
                        (error, result) => {

                            if (error) {

                                reject(error);

                            } else {

                                resolve(result);

                            }

                        }
                    );

                stream.end(req.file.buffer);

            });

            res.json({

                success: true,

                message: "Image uploaded successfully.",

                imageUrl: result.secure_url

            });

        } catch (error) {

            console.error("Cloudinary Upload Error:", error);

            res.status(500).json({

                success: false,

                message: "Image upload failed."

            });

        }

    }
);

module.exports = router;





