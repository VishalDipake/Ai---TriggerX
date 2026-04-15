const ApiError = require("../../utils/ApiError");

/**
 * DelayNode — pauses execution for a given duration.
 *
 * Config:
 *   duration: number (milliseconds)
 *   unit: "ms" | "seconds" | "minutes" (default: "ms")
 *
 * Example config:
 *   { duration: 10, unit: "seconds" } → wait 10 seconds
 */
class DelayNode {
  static type = "delay";

  static async execute(config, context) {
    const { duration, unit = "ms" } = config;

    if (!duration || isNaN(duration)) {
      throw new Error("DelayNode: duration is required and must be a number");
    }

    const durationMs = DelayNode.toMilliseconds(Number(duration), unit);

    // Safety cap: max 10 minutes for MVP
    const MAX_DELAY_MS = 10 * 60 * 1000;
    if (durationMs > MAX_DELAY_MS) {
      throw new Error(
        `DelayNode: max delay is 10 minutes. Got ${durationMs}ms`
      );
    }

    await DelayNode.sleep(durationMs);

    return {
      success: true,
      output: { delayedMs: durationMs },
      message: `Delayed for ${durationMs}ms`,
    };
  }

  static toMilliseconds(value, unit) {
    switch (unit) {
      case "seconds":
        return value * 1000;
      case "minutes":
        return value * 60 * 1000;
      case "ms":
      default:
        return value;
    }
  }

  static sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static validate(config) {
    if (!config.duration) {
      return { valid: false, message: "duration is required" };
    }
    return { valid: true };
  }
}

module.exports = DelayNode;