const { Resend } = require("resend");

const sendEmail = async (
  subject,
  text,
  recipient = process.env.EMAIL_USER
) => {

  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY is missing.");

    return {
      success: false,
      error: "RESEND_API_KEY is not configured."
    };
  }

  if (!recipient) {
    console.error("❌ No recipient email address provided.");

    return {
      success: false,
      error: "Recipient email is missing."
    };
  }

  try {

    const resend = new Resend(
      process.env.RESEND_API_KEY
    );

    const { data, error } = await resend.emails.send({

      from: "EJAR SOLUTIONS <onboarding@resend.dev>",

      to: [recipient],

      subject,

      text

    });

    if (error) {

      console.error(
        "❌ Resend Email Error:",
        error
      );

      return {
        success: false,
        error
      };

    }

    console.log(
      "✅ Email accepted by Resend."
    );

    console.log(
      "📧 Recipient:",
      recipient
    );

    console.log(
      "📨 Resend Email ID:",
      data?.id
    );

    return {
      success: true,
      data
    };

  } catch (error) {

    console.error(
      "❌ Email Sending Exception:",
      error
    );

    return {
      success: false,
      error: error.message || error
    };

  }

};

module.exports = sendEmail;