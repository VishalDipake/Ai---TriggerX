/**
 * WebhookNode — the trigger node.
 * It doesn't "do" anything during execution — it just passes
 * the incoming trigger data into the context for subsequent nodes.
 */
class WebhookNode {
  static type = "webhook";

  static async execute(config, context) {
    // Webhook is already triggered — just forward the data
    return {
      success: true,
      output: context.triggerData || {},
      message: "Webhook trigger received",
    };
  }

  static validate(config) {
    return { valid: true };
  }
}

module.exports = WebhookNode;