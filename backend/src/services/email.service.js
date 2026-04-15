const { Resend } = require("resend");
const logger = require("../utils/logger");

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send a single email via Resend.
 * @param {object} options
 * @param {string} options.to      - recipient email
 * @param {string} options.subject
 * @param {string} options.body    - HTML or plain text
 * @param {string} [options.from]  - override sender (defaults to env FROM_EMAIL)
 */
const sendEmail = async ({ to, subject, body, from }) => {
  const sender = from || process.env.FROM_EMAIL || "noreply@yourdomain.com";

  try {
    const { data, error } = await resend.emails.send({
      from: sender,
      to,
      subject,
      html: body.includes("<") ? body : `<p>${body}</p>`, // wrap plain text in <p>
    });

    if (error) {
      throw new Error(error.message || "Resend API error");
    }

    logger.info(`[EmailService] Email sent to ${to} | ID: ${data.id}`);
    return data; // { id: "..." }
  } catch (err) {
    logger.error(`[EmailService] Failed to send to ${to}: ${err.message}`);
    throw err;
  }
};

module.exports = { sendEmail };