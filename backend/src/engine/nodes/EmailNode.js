const emailService = require("../../services/email.service");
const { interpolateObject } = require("../../utils/templateEngine");

/**
 * EmailNode — sends an email with optional dynamic variables.
 *
 * Config:
 *   to:      "{{email}}" or "john@example.com"
 *   subject: "Hello {{name}}"
 *   body:    "Hi {{name}}, welcome!"  (supports HTML)
 *
 * Variables come from context.data (merged trigger + previous node outputs)
 */
class EmailNode {
  static type = "email";

  static async execute(config, context) {
    // Interpolate all {{variables}} in config using context data
    const resolved = interpolateObject(config, context.data);

    const { to, subject, body } = resolved;

    if (!to) throw new Error("EmailNode: 'to' field is required");
    if (!subject) throw new Error("EmailNode: 'subject' field is required");
    if (!body) throw new Error("EmailNode: 'body' field is required");

    // Basic email validation
    if (!/^\S+@\S+\.\S+$/.test(to)) {
      throw new Error(`EmailNode: invalid email address — ${to}`);
    }

    const result = await emailService.sendEmail({ to, subject, body });

    return {
      success: true,
      output: { to, subject, messageId: result.id },
      message: `Email sent to ${to}`,
    };
  }

  static validate(config) {
    if (!config.to) return { valid: false, message: "'to' is required" };
    if (!config.subject) return { valid: false, message: "'subject' is required" };
    if (!config.body) return { valid: false, message: "'body' is required" };
    return { valid: true };
  }
}

module.exports = EmailNode;