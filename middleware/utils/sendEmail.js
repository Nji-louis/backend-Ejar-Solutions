const { Resend } = require("resend");

const sendEmail = async (
    subject,
    text,
    recipient
) => {

    if (!process.env.RESEND_API_KEY) {

        console.error("RESEND_API_KEY is not configured.");

        return {
            success: false,
            message: "Email service is not configured."
        };
    }

    if (!recipient) {

        console.error("No email recipient provided.");

        return {
            success: false,
            message: "No email recipient provided."
        };
    }

    try {

        const resend = new Resend(
            process.env.RESEND_API_KEY
        );

        const { data, error } =
            await resend.emails.send({

                // Resend testing sender
                from: "EJAR SOLUTIONS <onboarding@resend.dev>",

                to: recipient,

                subject: subject,

                text: text
            });

        if (error) {

            console.error(
                "Resend Email Error:",
                error
            );

            return {
                success: false,
                error: error
            };
        }

        console.log(
            `Invitation email submitted to Resend: ${recipient}`
        );

        console.log(
            "Resend Email ID:",
            data?.id
        );

        return {
            success: true,
            data: data
        };

    } catch (error) {

        console.error(
            "Email Error:",
            error
        );

        return {
            success: false,
            error: error
        };
    }
};

module.exports = sendEmail;