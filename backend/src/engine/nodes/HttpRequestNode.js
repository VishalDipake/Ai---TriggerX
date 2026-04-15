const fetch = require("node-fetch");
const { interpolateObject } = require("../../utils/templateEngine");

/**
 * HttpRequestNode — makes an HTTP call to any external API.
 *
 * Config:
 *   url:     "https://api.example.com/users/{{userId}}"
 *   method:  "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
 *   headers: { "Authorization": "Bearer {{token}}" }
 *   body:    { "name": "{{name}}" }  (only for POST/PUT/PATCH)
 *
 * Output is stored in context so next nodes can use {{response.field}}
 */
class HttpRequestNode {
  static type = "httpRequest";

  static async execute(config, context) {
    const resolved = interpolateObject(config, context.data);
    const { url, method = "GET", headers = {}, body } = resolved;

    if (!url) throw new Error("HttpRequestNode: 'url' is required");

    const options = {
      method: method.toUpperCase(),
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      timeout: 10000,
    };

    const methodsWithBody = ["POST", "PUT", "PATCH"];
    if (methodsWithBody.includes(options.method) && body) {
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    let response;
    try {
      response = await fetch(url, options);
    } catch (err) {
      throw new Error(`HttpRequestNode: Request failed — ${err.message}`);
    }

    let responseData;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      throw new Error(
        `HttpRequestNode: ${method} ${url} returned ${response.status} — ${JSON.stringify(responseData)}`
      );
    }

    return {
      success: true,
      output: {
        status: response.status,
        response: responseData,
      },
      message: `${method} ${url} → ${response.status}`,
    };
  }

  static validate(config) {
    if (!config.url) return { valid: false, message: "'url' is required" };
    const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    if (config.method && !validMethods.includes(config.method.toUpperCase())) {
      return { valid: false, message: `Invalid method: ${config.method}` };
    }
    return { valid: true };
  }
}

module.exports = HttpRequestNode;