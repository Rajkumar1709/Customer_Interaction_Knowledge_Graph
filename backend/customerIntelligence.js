const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Build a structured chronological timeline from graph nodes
function buildTimeline(nodes) {
  const events = [];

  nodes.forEach(n => {
    const props = n.properties;
    if (n.label === 'Ticket') {
      events.push({
        type: 'Ticket',
        date: new Date(props.created),
        title: `Ticket: ${props.case_number}`,
        description: props.subject,
        severity: props.severity,
        status: props.status || 'Open'
      });
    } else if (n.label === 'HealthEvent') {
      events.push({
        type: 'HealthEvent',
        date: new Date(props.reported_on),
        title: `Health Event: ${props.title}`,
        description: [props.issue_type !== 'N/A' ? props.issue_type : null, props.description].filter(Boolean).join(' · '),
        severity: props.severity,
        status: props.status || 'Open'
      });
    } else if (n.label === 'PME') {
      events.push({
        type: 'PME',
        date: new Date(props.created_date),
        title: `Escalation: ${props.number}`,
        description: props.summary,
        severity: props.priority,
        status: props.status || 'Open'
      });
    } else if (n.label === 'Implementation') {
      events.push({
        type: 'Implementation',
        date: new Date(props.created),
        title: `Implementation: ${props.product}`,
        description: `Phase: ${props.phase}`,
        severity: 'Normal',
        status: props.status || 'In Progress'
      });
    } else if (n.label === 'Renewal') {
      events.push({
        type: 'Renewal',
        date: new Date(props.close_date),
        title: `Renewal: ${props.name}`,
        description: `Stage: ${props.stage} · ${props.expected_rev}`,
        severity: 'Normal',
        status: props.stage || 'Active'
      });
    } else if (n.label === 'Cancellation') {
      events.push({
        type: 'Cancellation',
        date: new Date(props.submitted_date),
        title: `Cancellation Submitted`,
        description: `Reason: ${props.reason}`,
        severity: 'Critical',
        status: props.status || 'Submitted'
      });
    }
  });

  // Sort chronological ascending (oldest to newest)
  events.sort((a, b) => a.date - b.date);

  // Filter out closed/resolved events — only keep active/open items
  const CLOSED_STATUSES = ['closed', 'resolved', 'completed', 'cancelled'];
  const openEvents = events.filter(e => {
    const s = String(e.status || '').toLowerCase();
    return !CLOSED_STATUSES.some(cs => s.includes(cs));
  });

  // Take the most recent 15 open events
  const recentEvents = openEvents.slice(-15);
  
  // Format dates back to string for easier JSON consumption
  return recentEvents.map(e => ({
    ...e,
    date: isNaN(e.date) ? 'N/A' : e.date.toISOString().split('T')[0]
  }));
}

/**
 * Generates the unified Account 360 AI intelligence payload
 */
async function generateAccountIntelligence(accountId, accName, score, nodes) {
  const timeline = buildTimeline(nodes);
  const isCritical = score < 50;

  try {
    const systemPrompt = `You are a Senior AI Customer Intelligence Engine for RealPage.
You are analyzing the interaction graph data for a property management company (PMC) named "${accName}".

The provided context includes an array of active graph nodes (Tickets, Implementations, Renewals, Escalations) and a chronological timeline of recent events.

Your goal is to generate a comprehensive, judge-ready JSON response with the following strictly formatted keys:

1. "briefing": A high-value executive summary of the account's current situation. You MUST quantify with numbers (e.g., specific risk factors, health score impact, revenue implications). It MUST structurally cover:
   - Why this account is risky (or healthy).
   - What is factually happening (citing data).
   - What it likely means (business implications).
   - What attention it requires.
2. "insights": An array of explainable AI insights. Each insight MUST have:
   - "title": A short string (e.g. "Rising Support Activity").
   - "type": "Risk" or "Opportunity" or "Observation".
   - "explanation": Plain-English explanation.
   - "evidence": Array of 1-3 strings explicitly citing graph data (e.g. "3 P1 tickets created in last 14 days"). IMPORTANT: When citing ACV or revenue risk, ALWAYS calculate and express it as a "% of Total ARR" based on the AccountPlan ARR, rather than just raw dollar amounts.
   - "confidence": "High", "Medium", or "Low".
3. "role_summaries": Targeted 1-2 sentence summaries tailored for specific roles. Must include keys:
   - "sales": Focus on whitespace, expansion, or renewal risk.
   - "csm": Focus on adoption, health, and next best actions.
   - "support": Focus on ticket volume, escalations, and technical friction.
   - "product": Focus on feature requests or systemic implementation blockers.
   - "executive": Focus on total revenue at risk, overall health, and strategic churn signals.
   - "implementation": Focus on onboarding bottlenecks, stalled phases, and SLA violations.
   - "renewals": Focus on upcoming contract dates, competitor presence, and cancellation history.
4. "next_best_actions": Array of 3 highly actionable recommendations. ORDER them by urgency (most urgent first). Each must be an object with:
   - "action": The text of the recommendation.
   - "owner": The specific role/team to assign this to (e.g., "CSM", "Sales", "Product", "Support", "Executive").
   - "timeframe": "Immediate", "Short-term", or "Long-term".

Ensure your analysis is heavily grounded in the provided data. Do not hallucinate data that is not in the context.

Context:
Nodes: ${JSON.stringify(nodes.map(n => ({ label: n.label, ...n.properties })))}
Recent Timeline: ${JSON.stringify(timeline)}
Current Health Score: ${score}/100
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    return {
      success: true,
      data: {
        ...aiResponse,
        timeline,
        risk_score: score,
        risk_band: isCritical ? (score < 25 ? 'Critical Risk' : 'High Risk') : (score > 75 ? 'Healthy' : 'Stable')
      }
    };
  } catch (error) {
    console.error("AI Intelligence generation failed:", error.message);
    return { success: false, error: error.message, timeline, score };
  }
}

/**
 * Handles Natural Language Q&A over the account graph
 */
async function answerGraphQuestion(accName, nodes, question) {
  try {
    const systemPrompt = `You are an Enterprise AI Customer Intelligence Assistant. 
You are answering a user's question about the account "${accName}".
Use the provided graph node data as your single source of truth.

You MUST respond with a strictly formatted JSON object matching this schema. Omit keys that are not relevant to the question.
{
  "summary": "A direct, concise, business-friendly answer to the question.",
  "key_risks": ["Risk point 1", "Risk point 2"],
  "opportunities": ["Opportunity 1", "Opportunity 2"],
  "recommended_actions": ["Action 1", "Action 2"],
  "supporting_evidence": ["Evidence from data 1", "Evidence from data 2"]
}

If the data does not contain the answer, state that clearly in the "summary" and omit the other fields.
Do not hallucinate. Cite specific evidence from the data where appropriate.

Context (Graph Nodes):
${JSON.stringify(nodes.map(n => ({ label: n.label, ...n.properties })))}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: question }
      ],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    return { success: true, answer: parsedResponse };
  } catch (error) {
    console.error("Q&A generation failed:", error.message);
    return { success: false, answer: { summary: "I'm sorry, I encountered an error while analyzing the account data." } };
  }
}

/**
 * Analyzes a specific group of nodes to extract data-grounded insights 
 * without including raw email clutter.
 */
async function analyzeNodeGroup(label, items) {
  try {
    const systemPrompt = `You are an Enterprise AI Customer Intelligence Assistant. 
You are analyzing a specific group of "${label}" records for an account.
Your task is to extract a strictly data-grounded analysis of the impact, context, and action items.

CRITICAL INSTRUCTIONS:
1. Do NOT hallucinate or assume any information. Only use the data provided.
2. DO NOT include raw email threads, long raw descriptions, or clutter. Summarize the analytical points cleanly.
3. If there are no action items in the data, explicitly state "No action items available in dataset".

You MUST respond with a strictly formatted JSON object matching this schema:
{
  "impact_analysis": ["Bullet point 1 regarding quantifiable or business impact", "Bullet point 2"],
  "issue_context": ["Clean summary of the core issue 1 without email clutter", "Clean summary of issue 2"],
  "action_items": ["Action item 1 found in data", "Action item 2 found in data"]
}

Data Context to Analyze:
${JSON.stringify(items.map(item => item.properties || {}))}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: "Analyze these records and provide the clean JSON summary." }
      ],
      response_format: { type: "json_object" }
    });

    const parsedResponse = JSON.parse(completion.choices[0].message.content);
    return { success: true, analysis: parsedResponse };
  } catch (error) {
    console.error("Node analysis failed:", error.message);
    return { 
      success: false, 
      analysis: { 
        impact_analysis: ["Analysis currently unavailable."], 
        issue_context: ["Data could not be processed."], 
        action_items: [] 
      } 
    };
  }
}

module.exports = {
  buildTimeline,
  generateAccountIntelligence,
  answerGraphQuestion,
  analyzeNodeGroup
};
