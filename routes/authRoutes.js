const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


const router = express.Router();
const db = require("../config/db");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log(hashedPassword);

  const sql =
    "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";

  db.query(sql, [name, email, hashedPassword], (err, result) => {
    if (err) return res.status(500).json(err);

    res.json({
      message: "User Registered",
    });
  });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, results) => {
      if (results.length === 0) {
        return res.status(400).json({
          message: "User not found",
        });
      }

      const user = results[0];

      if (
  user.status !== "active" ||
  Number(user.email_verified) !== 1
) {

  return res.status(403).json({
    success: false,
    message:
      "Please activate your account from the invitation email before logging in."
  });

}

      const validPassword = await bcrypt.compare(
        password,
        user.password
      );

      if (!validPassword) {
        return res.status(400).json({
          message: "Invalid password",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

     res.json({
  token,
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  }
});
    }
  );
});






// =====================================
// FORGOT PASSWORD
// =====================================

router.post("/forgot-password", (req, res) => {

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email address is required."
    });
  }

  db.query(
    "SELECT id, name, email FROM users WHERE email = ? LIMIT 1",
    [email],
    async (err, results) => {

      if (err) {
        console.error("Forgot Password DB Error:", err);

        return res.status(500).json({
          success: false,
          message: "Database error."
        });
      }

      if (results.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No account was found with this email address."
        });
      }

      const user = results[0];

      // Generate secure random token
      const resetToken =
        crypto.randomBytes(32).toString("hex");

      // Hash token before storing it
      const hashedResetToken =
        crypto
          .createHash("sha256")
          .update(resetToken)
          .digest("hex");

      // Token expires in 1 hour
      const resetTokenExpiry =
        new Date(Date.now() + 60 * 60 * 1000);

      db.query(
        `
        UPDATE users
        SET
          reset_token = ?,
          reset_token_expiry = ?
        WHERE id = ?
        `,
        [
          hashedResetToken,
          resetTokenExpiry,
          user.id
        ],
        async (updateErr) => {

          if (updateErr) {

            console.error(
              "Save Reset Token Error:",
              updateErr
            );

            return res.status(500).json({
              success: false,
              message: "Unable to create password reset request."
            });

          }

          const resetLink =
            `https://ejar-solutions-main.onrender.com/admin/reset-password.html?token=${resetToken}`;

          try {

  const emailResult = await sendEmail(
    "Reset Your EJAR SOLUTIONS Password",

    `Hello ${user.name},

We received a request to reset your EJAR SOLUTIONS dashboard password.

Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you did not request a password reset, you can safely ignore this email.

Best regards,
EJAR SOLUTIONS
Business Support Services`,

    user.email
  );

  if (!emailResult || !emailResult.success) {

    console.error(
      "❌ Password reset email was NOT sent:",
      emailResult?.error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to send password reset email."
    });

  }

  console.log(
    `✅ Password reset email sent to: ${user.email}`
  );

  console.log(
    `📨 Resend ID: ${emailResult.data?.id}`
  );

  return res.json({
    success: true,
    message:
      "Password reset instructions have been sent to your email."
  });

} catch (emailError) {

  console.error(
    "❌ Password Reset Email Error:",
    emailError
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to send password reset email."
  });

}  
        }
      );

    }
  );

});


// =====================================
// RESET PASSWORD
// =====================================

router.post(
  "/reset-password/:token",
  async (req, res) => {

    try {

      const { token } = req.params;
      const { password } = req.body;

      if (!token || !password) {

        return res.status(400).json({
          success: false,
          message:
            "Reset token and password are required."
        });

      }

      if (password.length < 8) {

        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters."
        });

      }

      // Hash token received from reset link
      const hashedResetToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      db.query(
        `
        SELECT
          id,
          name,
          email,
          reset_token_expiry
        FROM users
        WHERE reset_token = ?
        LIMIT 1
        `,
        [hashedResetToken],
        async (err, results) => {

          if (err) {

            console.error(
              "Reset Password DB Error:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Database error."
            });

          }

          if (results.length === 0) {

            return res.status(400).json({
              success: false,
              message:
                "Password reset link is invalid or has already been used."
            });

          }

          const user = results[0];

          // Check expiration
          if (
            !user.reset_token_expiry ||
            new Date(user.reset_token_expiry) < new Date()
          ) {

            return res.status(400).json({
              success: false,
              message:
                "This password reset link has expired."
            });

          }

          // Create new password hash
          const hashedPassword =
            await bcrypt.hash(password, 10);

          db.query(
            `
            UPDATE users
            SET
              password = ?,
              reset_token = NULL,
              reset_token_expiry = NULL
            WHERE id = ?
            `,
            [
              hashedPassword,
              user.id
            ],
            (updateErr) => {

              if (updateErr) {

                console.error(
                  "Update Password Error:",
                  updateErr
                );

                return res.status(500).json({
                  success: false,
                  message:
                    "Unable to reset password."
                });

              }

              return res.json({
                success: true,
                message:
                  "Password reset successful. You can now log in with your new password."
              });

            }
          );

        }
      );

    } catch (error) {

      console.error(
        "Reset Password Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to reset password."
      });

    }

  }
);







// =====================================
// ACCEPT USER INVITATION
// =====================================

router.post(
  "/accept-invite",
  async (req, res) => {

    try {

      const {
        token,
        password
      } = req.body;

      if (!token || !password) {

        return res.status(400).json({
          success: false,
          message:
            "Invitation token and password are required."
        });

      }

      if (password.length < 8) {

        return res.status(400).json({
          success: false,
          message:
            "Password must contain at least 8 characters."
        });

      }

      // Hash token received from email

      const hashedToken =
        crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

      db.query(
        `
        SELECT
          id,
          name,
          email,
          role,
          status,
          invite_expires
        FROM users
        WHERE invite_token = ?
        LIMIT 1
        `,
        [hashedToken],
        async (err, results) => {

          if (err) {

            console.error(
              "Accept Invite Error:",
              err
            );

            return res.status(500).json({
              success: false,
              message: "Database error."
            });

          }

          if (results.length === 0) {

            return res.status(400).json({
              success: false,
              message:
                "Invitation link is invalid or has already been used."
            });

          }

          const user =
            results[0];

          if (
            !user.invite_expires ||
            new Date(user.invite_expires) <
              new Date()
          ) {

            return res.status(400).json({
              success: false,
              message:
                "This invitation has expired."
            });

          }

          if (user.status !== "pending") {

            return res.status(400).json({
              success: false,
              message:
                "This invitation is no longer valid."
            });

          }

          const hashedPassword =
            await bcrypt.hash(
              password,
              10
            );

          db.query(
            `
            UPDATE users
            SET
              password = ?,
              status = 'active',
              email_verified = 1,
              invite_token = NULL,
              invite_expires = NULL
            WHERE id = ?
            `,
            [
              hashedPassword,
              user.id
            ],
            (updateErr) => {

              if (updateErr) {

                console.error(
                  "Activate User Error:",
                  updateErr
                );

                return res
                  .status(500)
                  .json({
                    success: false,
                    message:
                      "Unable to activate account."
                  });

              }

              res.json({
                success: true,
                message:
                  "Account activated successfully. You can now log in."
              });

            }
          );

        }
      );

    } catch (error) {

      console.error(
        "Accept Invitation Error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Unable to activate account."
      });

    }

  }
);

module.exports = router;