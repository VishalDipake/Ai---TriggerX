const OpenAI = require("openai");
const logger = require("../utils/logger");
const ApiError = require("../utils/ApiError");

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generates a workflow JSON from a plain-English description.
 *
 * Example input:
 *   "When someone signs up, wait 10 minutes then send a welcome email"
 *
 * Example output:
 *   {
 *     "name": "Welcome Email Workflow",
 *     "nodes": [...],
 *     "edges": [...]
 *   }
 */
const generateWorkflow = async (prompt) => {
  if (!process.env.OPENAI_API_KEY) {
    throw ApiError.internal("OpenAI API key not configured");
  }

  const systemPrompt = `You are a workflow automation assistant. The user will describe an automation task in plain English and you must convert it into a workflow JSON.

AVAILABLE NODE TYPES:
1. "webhook"     — the trigger. Always the first node. No config needed.
2. "delay"       — pause execution. Config: { "duration": <number>, "unit": "ms"|"seconds"|"minutes" }
3. "email"       — send email. Config: { "to": "<email or {{variable}}>", "subject": "<text>", "body": "<html or text>" }
4. "httpRequest" — call an API. Config: { "url": "<url>", "method": "GET|POST|PUT|DELETE", "headers": {}, "body": {} }

RULES:
- Always start with a "webhook" node
- Use {{variable}} for dynamic data (e.g., {{name}}, {{email}})
- Generate unique short IDs for nodes (e.g., "node_1", "node_2")
- Edges connect source node id to target node id
- Keep it simple and linear for now

RESPOND ONLY with valid JSON in this exact format (no markdown, no explanation):
{
  "name": "<workflow name>",
  "description": "<one line description>",
  "nodes": [
    {
      "id": "node_1",
      "type": "webhook",
      "position": { "x": 100, "y": 100 },
      "data": {}
    }
  ],
  "edges": [
    { "id": "edge_1", "source": "node_1", "target": "node_2" }
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content.trim();

    // Strip markdown code fences if present
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let workflow;
    try {
      workflow = JSON.parse(cleaned);
    } catch {
      logger.error(`[AI] Invalid JSON from OpenAI: ${cleaned}`);
      throw ApiError.internal("AI returned invalid workflow format. Try rephrasing.");
    }

    // Basic validation
    if (!workflow.nodes || !Array.isArray(workflow.nodes)) {
      throw ApiError.internal("AI returned workflow with no nodes");
    }

    logger.info(`[AI] Generated workflow: "${workflow.name}" with ${workflow.nodes.length} nodes`);
    return workflow;
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err.code === "insufficient_quota") {
      throw ApiError.internal("OpenAI quota exceeded. Check your billing.");
    }

    logger.error(`[AI] OpenAI error: ${err.message}`);
    throw ApiError.internal(`AI service error: ${err.message}`);
  }
};

module.exports = { generateWorkflow };