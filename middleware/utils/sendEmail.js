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
            message: "Email service not configured."
        };
    }

    try {
        const resend = new Resend(
            process.env.RESEND_API_KEY
        );

        const { data, error } =
            await resend.emails.send({
                from: "EJAR SOLUTIONS <onboarding@resend.dev>",
                to: recipient,
                subject,
                text
            });

        if (error) {
            console.error("Resend Email Error:", error);

            return {
                success: false,
                error
            };
        }

        console.log(
            `Invitation email submitted to Resend: ${recipient}`
        );

        return {
            success: true,
            data
        };

    } catch (error) {
        console.error("Email Error:", error);

        return {
            success: false,
            error
        };
    }
};

module.exports = sendEmail;