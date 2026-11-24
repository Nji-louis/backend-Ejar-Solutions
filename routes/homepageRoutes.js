const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin =require("../middleware/adminMiddleware");
const verifyEditorOrAdmin = require("../middleware/editorMiddleware");






/* ==========================================
   HOMEPAGE SETTINGS
========================================== */

// Get Homepage Settings

router.get("/settings", verifyToken, verifyAdmin, (req, res) => {

    db.query(

        "SELECT * FROM homepage_settings LIMIT 1",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results[0] || {});

        }

    );

});


// Public Settings

router.get("/public/settings", (req, res) => {

    db.query(

        "SELECT * FROM homepage_settings LIMIT 1",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results[0] || {});

        }

    );

});



/* ==========================================
   COUNTERS
========================================== */

router.get("/counters", verifyToken, verifyEditorOrAdmin, (req, res) => {

    db.query(

        "SELECT * FROM homepage_counters ORDER BY sort_order ASC",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results);

        }

    );

});


router.get("/public/counters", (req, res) => {

    db.query(

        "SELECT * FROM homepage_counters WHERE status='active' ORDER BY sort_order ASC",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results);

        }

    );

});





/* ==========================================
   PARTNERS
========================================== */

router.get("/partners", verifyToken, verifyEditorOrAdmin, (req, res) => {

    db.query(

        "SELECT * FROM partners ORDER BY sort_order ASC",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results);

        }

    );

});


router.get("/public/partners", (req, res) => {

    db.query(

        "SELECT * FROM partners WHERE status='active' ORDER BY sort_order ASC",

        (err, results) => {

            if (err) return res.status(500).json(err);

            res.json(results);

        }

    );

});

// CREATE PARTNER
router.post("/partners", verifyToken, verifyEditorOrAdmin, (req, res) => {

    const {
        name,
        logo,
        website,
        sort_order,
        status
    } = req.body;

    db.query(

        `INSERT INTO partners
        (
            name,
            logo,
            website,
            sort_order,
            status
        )
        VALUES (?,?,?,?,?)`,

        [
            name,
            logo,
            website,
            sort_order,
            status
        ],

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({
                success:true,
                message:"Partner created successfully."
            });

        }

    );

});

// UPDATE PARTNER
router.put("/partners/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {

    const {
        name,
        logo,
        website,
        sort_order,
        status
    } = req.body;

    db.query(

        `UPDATE partners
         SET
            name=?,
            logo=?,
            website=?,
            sort_order=?,
            status=?
         WHERE id=?`,

        [
            name,
            logo,
            website,
            sort_order,
            status,
            req.params.id
        ],

        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({
                success:true,
                message:"Partner updated successfully."
            });

        }

    );

});

// DELETE PARTNER
router.delete("/partners/:id", verifyToken, verifyAdmin, (req, res) => {

    db.query(
        "DELETE FROM partners WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({
                success:true,
                message:"Partner deleted successfully."
            });

        }
    );

});



// ==========================================
// HOMEPAGE COUNTERS
// ==========================================


// GET COUNTERS ADMIN

router.get(
"/counters",
verifyToken,
verifyEditorOrAdmin,
(req,res)=>{


db.query(

"SELECT * FROM homepage_counters ORDER BY sort_order ASC",

(err,results)=>{

if(err)
return res.status(500).json(err);


res.json(results);


}


);


});





// ADD COUNTER


router.post(

"/counters",

verifyToken,

verifyEditorOrAdmin,

(req,res)=>{


const {

number,
title,
icon,
sort_order,
status


}=req.body;



db.query(

`
INSERT INTO homepage_counters
(
number,
title,
icon,
sort_order,
status
)

VALUES (?,?,?,?,?)

`,

[
number,
title,
icon,
sort_order,
status
],


(err)=>{


if(err)
return res.status(500).json(err);



res.json({

success:true,

message:"Counter created successfully"

});


}


);


});






// UPDATE COUNTER


router.put(

"/counters/:id",

verifyToken,

verifyEditorOrAdmin,

(req,res)=>{


const {

number,
title,
icon,
sort_order,
status


}=req.body;



db.query(

`

UPDATE homepage_counters

SET

number=?,

title=?,

icon=?,

sort_order=?,

status=?

WHERE id=?


`,

[

number,
title,
icon,
sort_order,
status,
req.params.id

],


(err)=>{


if(err)
return res.status(500).json(err);



res.json({

success:true,

message:"Counter updated successfully"

});


}



);



});







// DELETE COUNTER


router.delete(

"/counters/:id",

verifyToken,

verifyAdmin,

(req,res)=>{


db.query(

"DELETE FROM homepage_counters WHERE id=?",

[req.params.id],


(err)=>{


if(err)
return res.status(500).json(err);



res.json({

success:true,

message:"Counter deleted successfully"

});


}



);



});





// ==========================================
// WHY CHOOSE US
// ==========================================

// GET ADMIN
router.get("/why", verifyToken, verifyAdmin, (req,res)=>{

    db.query(
        "SELECT * FROM why_choose_us ORDER BY sort_order ASC",
        (err,results)=>{

            if(err) return res.status(500).json(err);

            res.json(results);

        }
    );

});

// GET PUBLIC
router.get("/public/why", (req,res)=>{

    db.query(
        "SELECT * FROM why_choose_us WHERE status='active' ORDER BY sort_order ASC",
        (err,results)=>{

            if(err) return res.status(500).json(err);

            res.json(results);

        }
    );

});

// CREATE
router.post("/why", verifyToken, verifyAdmin, (req,res)=>{

    const {

        icon,
        title,
        description,
        image,
        sort_order,
        status

    } = req.body;

    db.query(

        `INSERT INTO why_choose_us
        (
            icon,
            title,
            description,
            image,
            sort_order,
            status
        )
        VALUES (?,?,?,?,?,?)`,

        [
            icon,
            title,
            description,
            image,
            sort_order,
            status
        ],

        (err)=>{

            if(err){

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success:true,
                message:"Feature created successfully."

            });

        }
    );

});

// UPDATE
router.put("/why/:id", verifyToken, verifyAdmin, (req,res)=>{

    const {

        icon,
        title,
        description,
        image,
        sort_order,
        status

    } = req.body;

    db.query(

        `UPDATE why_choose_us
         SET
            icon=?,
            title=?,
            description=?,
            image=?,
            sort_order=?,
            status=?
         WHERE id=?`,

        [
            icon,
            title,
            description,
            image,
            sort_order,
            status,
            req.params.id
        ],

        (err)=>{

            if(err){

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success:true,
                message:"Feature updated successfully."

            });

        }
    );

});

// DELETE
router.delete("/why/:id", verifyToken, verifyAdmin, (req,res)=>{

    db.query(

        "DELETE FROM why_choose_us WHERE id=?",
        [req.params.id],

        (err)=>{

            if(err){

                console.log(err);

                return res.status(500).json(err);

            }

            res.json({

                success:true,
                message:"Feature deleted successfully."

            });

        }
    );

});





/* ==========================================
   HOMEPAGE HERO SLIDER
========================================== */

// GET ALL HERO SLIDES (ADMIN DASHBOARD)
router.get("/hero", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "SELECT * FROM hero_slides ORDER BY sort_order ASC, id ASC",
        (err, results) => {
            if (err) {
                console.error("Hero slides error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to load hero slides."
                });
            }

            res.json(results);
        }
    );
});


// GET ACTIVE HERO SLIDES (PUBLIC WEBSITE)
router.get("/public/hero", (req, res) => {
    db.query(
        `SELECT * FROM hero_slides
         WHERE status = 'active'
         ORDER BY sort_order ASC, id ASC`,
        (err, results) => {
            if (err) {
                console.error("Public hero error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to load homepage slides."
                });
            }

            res.json(results);
        }
    );
});


// CREATE HERO SLIDE
router.post("/hero", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        title,
        subtitle,
        description,
        image,
        button1_text,
        button1_url,
        button2_text,
        button2_url,
        sort_order,
        status
    } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Hero title is required."
        });
    }

    db.query(
        `INSERT INTO hero_slides
        (
            title, subtitle, description, image,
            button1_text, button1_url,
            button2_text, button2_url,
            sort_order, status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            title.trim(),
            subtitle || "",
            description || "",
            image || "",
            button1_text || "",
            button1_url || "",
            button2_text || "",
            button2_url || "",
            Number(sort_order) || 0,
            status === "inactive" ? "inactive" : "active"
        ],
        (err, result) => {
            if (err) {
                console.error("Create hero error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to create hero slide."
                });
            }

            res.status(201).json({
                success: true,
                id: result.insertId,
                message: "Hero slide created successfully."
            });
        }
    );
});


// UPDATE HERO SLIDE
router.put("/hero/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        title,
        subtitle,
        description,
        image,
        button1_text,
        button1_url,
        button2_text,
        button2_url,
        sort_order,
        status
    } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Hero title is required."
        });
    }

    db.query(
        `UPDATE hero_slides SET
            title = ?,
            subtitle = ?,
            description = ?,
            image = ?,
            button1_text = ?,
            button1_url = ?,
            button2_text = ?,
            button2_url = ?,
            sort_order = ?,
            status = ?
         WHERE id = ?`,
        [
            title.trim(),
            subtitle || "",
            description || "",
            image || "",
            button1_text || "",
            button1_url || "",
            button2_text || "",
            button2_url || "",
            Number(sort_order) || 0,
            status === "inactive" ? "inactive" : "active",
            req.params.id
        ],
        (err, result) => {
            if (err) {
                console.error("Update hero error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to update hero slide."
                });
            }

            if (!result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: "Hero slide not found."
                });
            }

            res.json({
                success: true,
                message: "Hero slide updated successfully."
            });
        }
    );
});


// DELETE HERO SLIDE
router.delete("/hero/:id", verifyToken, verifyAdmin, (req, res) => {
    db.query(
        "DELETE FROM hero_slides WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                console.error("Delete hero error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to delete hero slide."
                });
            }

            if (!result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: "Hero slide not found."
                });
            }

            res.json({
                success: true,
                message: "Hero slide deleted successfully."
            });
        }
    );
});





// ==========================================
// ABOUT SECTION API
// ==========================================

// GET ABOUT CONTENT - ADMIN
router.get("/about", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query("SELECT * FROM homepage_about ORDER BY id ASC LIMIT 1", (err, results) => {
        if (err) {
            console.error("Get About error:", err);
            return res.status(500).json({
                success: false,
                message: "Unable to load About content."
            });
        }

        res.json(results[0] || {});
    });
});

// GET ABOUT CONTENT - PUBLIC
router.get("/public/about", (req, res) => {
    db.query("SELECT * FROM homepage_about ORDER BY id ASC LIMIT 1", (err, results) => {
        if (err) {
            console.error("Public About error:", err);
            return res.status(500).json({
                success: false,
                message: "Unable to load About content."
            });
        }

        res.json(results[0] || {});
    });
});

// UPDATE ABOUT CONTENT
router.put("/about", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        heading,
        subtitle,
        description,
        image,
        experience_years,
        button_text,
        button_url,
        section_label,
        company_heading,
        description2,
        description3,
        description4,
        description5,
        slogan
    } = req.body;

    const values = [
        heading || "",
        subtitle || "",
        description || "",
        image || "",
        experience_years || "",
        button_text || "",
        button_url || "",
        section_label || "",
        company_heading || "",
        description2 || "",
        description3 || "",
        description4 || "",
        description5 || "",
        slogan || ""
    ];

    db.query(
        `UPDATE homepage_about SET
            heading = ?,
            subtitle = ?,
            description = ?,
            image = ?,
            experience_years = ?,
            button_text = ?,
            button_url = ?,
            section_label = ?,
            company_heading = ?,
            description2 = ?,
            description3 = ?,
            description4 = ?,
            description5 = ?,
            slogan = ?
         WHERE id = (SELECT id FROM (SELECT id FROM homepage_about ORDER BY id ASC LIMIT 1) AS first_about)`,
        values,
        (err, result) => {
            if (err) {
                console.error("Update About error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to update About content."
                });
            }

            if (!result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: "About record not found."
                });
            }

            res.json({
                success: true,
                message: "About content updated successfully."
            });
        }
    );
});


// ==========================================
// ABOUT PILLARS API
// ==========================================

// GET ALL PILLARS - ADMIN
router.get("/about/pillars", verifyToken, verifyEditorOrAdmin, (req, res) => {
    db.query(
        "SELECT * FROM homepage_about_pillars ORDER BY sort_order ASC, id ASC",
        (err, results) => {
            if (err) {
                console.error("Get About Pillars error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to load About pillars."
                });
            }

            res.json(results);
        }
    );
});

// GET ACTIVE PILLARS - PUBLIC
router.get("/public/about/pillars", (req, res) => {
    db.query(
        "SELECT * FROM homepage_about_pillars WHERE status = 'active' ORDER BY sort_order ASC, id ASC",
        (err, results) => {
            if (err) {
                console.error("Public About Pillars error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to load About pillars."
                });
            }

            res.json(results);
        }
    );
});

// CREATE PILLAR
router.post("/about/pillars", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        pillar_title,
        column1_heading,
        column2_heading,
        column3_heading,
        row1_item, row1_audience, row1_service, row1_benefit,
        row2_item, row2_audience, row2_service, row2_benefit,
        row3_item, row3_audience, row3_service, row3_benefit,
        sort_order,
        status
    } = req.body;

    if (!pillar_title || !pillar_title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Pillar title is required."
        });
    }

    const values = [
        pillar_title.trim(),
        column1_heading || "Who We Help",
        column2_heading || "What We Do",
        column3_heading || "Why It Matters",
        row1_item || "", row1_audience || "", row1_service || "", row1_benefit || "",
        row2_item || "", row2_audience || "", row2_service || "", row2_benefit || "",
        row3_item || "", row3_audience || "", row3_service || "", row3_benefit || "",
        Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
        status === "inactive" ? "inactive" : "active"
    ];

    db.query(
        `INSERT INTO homepage_about_pillars (
            pillar_title, column1_heading, column2_heading, column3_heading,
            row1_item, row1_audience, row1_service, row1_benefit,
            row2_item, row2_audience, row2_service, row2_benefit,
            row3_item, row3_audience, row3_service, row3_benefit,
            sort_order, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        values,
        (err, result) => {
            if (err) {
                console.error("Create About Pillar error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to create About pillar."
                });
            }

            res.status(201).json({
                success: true,
                message: "About pillar created successfully.",
                id: result.insertId
            });
        }
    );
});

// UPDATE PILLAR
router.put("/about/pillars/:id", verifyToken, verifyEditorOrAdmin, (req, res) => {
    const {
        pillar_title,
        column1_heading,
        column2_heading,
        column3_heading,
        row1_item, row1_audience, row1_service, row1_benefit,
        row2_item, row2_audience, row2_service, row2_benefit,
        row3_item, row3_audience, row3_service, row3_benefit,
        sort_order,
        status
    } = req.body;

    if (!pillar_title || !pillar_title.trim()) {
        return res.status(400).json({
            success: false,
            message: "Pillar title is required."
        });
    }

    const values = [
        pillar_title.trim(),
        column1_heading || "Who We Help",
        column2_heading || "What We Do",
        column3_heading || "Why It Matters",
        row1_item || "", row1_audience || "", row1_service || "", row1_benefit || "",
        row2_item || "", row2_audience || "", row2_service || "", row2_benefit || "",
        row3_item || "", row3_audience || "", row3_service || "", row3_benefit || "",
        Number.isFinite(Number(sort_order)) ? Number(sort_order) : 0,
        status === "inactive" ? "inactive" : "active",
        req.params.id
    ];

    db.query(
        `UPDATE homepage_about_pillars SET
            pillar_title = ?, column1_heading = ?, column2_heading = ?, column3_heading = ?,
            row1_item = ?, row1_audience = ?, row1_service = ?, row1_benefit = ?,
            row2_item = ?, row2_audience = ?, row2_service = ?, row2_benefit = ?,
            row3_item = ?, row3_audience = ?, row3_service = ?, row3_benefit = ?,
            sort_order = ?, status = ?
         WHERE id = ?`,
        values,
        (err, result) => {
            if (err) {
                console.error("Update About Pillar error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to update About pillar."
                });
            }

            if (!result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: "About pillar not found."
                });
            }

            res.json({
                success: true,
                message: "About pillar updated successfully."
            });
        }
    );
});

// DELETE PILLAR - ADMIN ONLY
router.delete("/about/pillars/:id", verifyToken, verifyAdmin, (req, res) => {
    db.query(
        "DELETE FROM homepage_about_pillars WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                console.error("Delete About Pillar error:", err);
                return res.status(500).json({
                    success: false,
                    message: "Unable to delete About pillar."
                });
            }

            if (!result.affectedRows) {
                return res.status(404).json({
                    success: false,
                    message: "About pillar not found."
                });
            }

            res.json({
                success: true,
                message: "About pillar deleted successfully."
            });
        }
    );
});

module.exports = router;