const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

    console.log("Authorization Header:", req.headers.authorization);

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access Denied"
        });
    }

    const token = authHeader.split(" ")[1];

    try {

        const verified = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = verified;

        next();

    } catch (err) {

        console.log(err);

        res.status(400).json({
            message: "Invalid Token"
        });

    }

};

module.exports = verifyToken;






