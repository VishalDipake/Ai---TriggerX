/**
 * Replaces {{variable}} placeholders in strings using a flat context object.
 *
 * Context is built from trigger data + outputs of previous nodes.
 *
 * Example:
 *   interpolate("Hello {{name}}", { name: "Roman" }) → "Hello Roman"
 */

const interpolate = (template, context = {}) => {
  if (typeof template !== "string") return template;

  return template.replace(/\{\{(\s*[\w.]+\s*)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(context, trimmedKey);
    return value !== undefined ? String(value) : match; // leave unchanged if not found
  });
};

/**
 * Support dot notation: {{user.email}} → context.user.email
 */
const getNestedValue = (obj, path) => {
  return path.split(".").reduce((acc, key) => {
    return acc !== undefined && acc !== null ? acc[key] : undefined;
  }, obj);
};

/**
 * Recursively interpolate all string values in an object.
 * Used to process entire node config at once.
 */
const interpolateObject = (obj, context = {}) => {
  if (typeof obj === "string") return interpolate(obj, context);
  if (Array.isArray(obj)) return obj.map((item) => interpolateObject(item, context));
  if (obj !== null && typeof obj === "object") {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = interpolateObject(value, context);
    }
    return result;
  }
  return obj;
};

module.exports = { interpolate, interpolateObject };