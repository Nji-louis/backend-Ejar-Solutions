const { Resend } = require("resend");

const sendEmail = async (

    subject,
    text,
    recipient = process.env.EMAIL_USER

) => {

    // Skip email if no API key is configured

    if (!process.env.RESEND_API_KEY) {

        console.warn(
            "⚠️ RESEND_API_KEY not configured. Email skipped."
        );

        return {

            success: false,
            message: "Email service disabled during development."

        };

    }

    try {

        const resend = new Resend(
            process.env.RESEND_API_KEY
        );

        const response = await resend.emails.send({

            from: "EJAR SOLUTIONS <onboarding@resend.dev>",

            to: recipient, // IMPORTANT: send to the provided email

            subject,

            text,

        });

        console.log(
            `Email sent to: ${recipient}`
        );

        return response;

    } catch (error) {

        console.error(
            "Email Error:",
            error
        );

        return {

            success: false,
            message: "Failed to send email."

        };

    }

};

module.exports = sendEmail;




