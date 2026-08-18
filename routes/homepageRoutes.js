const express = require("express");
const router = express.Router();

const db = require("../config/db");

const verifyToken = require("../middleware/authMiddleware");
const verifyAdmin = require("../middleware/adminMiddleware");





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

router.get("/counters", verifyToken, verifyAdmin, (req, res) => {

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

router.get("/partners", verifyToken, verifyAdmin, (req, res) => {

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
router.post("/partners", verifyToken, verifyAdmin, (req, res) => {

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
router.put("/partners/:id", verifyToken, verifyAdmin, (req, res) => {

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
verifyAdmin,
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

verifyAdmin,

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

verifyAdmin,

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



module.exports = router;