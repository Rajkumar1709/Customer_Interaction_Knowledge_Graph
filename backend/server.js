require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq client (OpenAI-compatible, free tier)
const openai = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Load the 1500 simulated PMC Graph Database
let db = { accounts: [], graphMap: {} };
try {
  const dbPath = path.join(__dirname, '../frontend/src/data/mockDb.json');
  const rawData = fs.readFileSync(dbPath);
  db = JSON.parse(rawData);
  console.log(`Loaded ${db.accounts.length} PMCs into memory.`);
} catch (e) {
  console.error("Warning: mockDb.json not found.");
}

app.get('/api/accounts/search', (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 15;
  const risky = req.query.risky === 'true';
  const renewal = req.query.renewal === 'true';
  const implementation = req.query.implementation === 'true';

  let results = db.accounts;

  // Text search
  if (query) {
    results = results.filter(acc =>
      acc.name.toLowerCase().includes(query) || acc.id.toLowerCase().includes(query)
    );
  }

  // Filter: Show Risky Accounts (health < 50)
  if (risky) {
    results = results.filter(acc => acc.health_score < 50);
  }

  // Filter: Renewal < 90 Days
  if (renewal) {
    results = results.filter(acc => {
      const graph = db.graphMap[acc.id];
      if (!graph) return false;
      return graph.nodes.some(n => n.label === 'Renewal' && n.properties.days_to_renewal < 90);
    });
  }

  // Filter: Stalled Implementation
  if (implementation) {
    results = results.filter(acc => {
      const graph = db.graphMap[acc.id];
      if (!graph) return false;
      return graph.nodes.some(n => n.label === 'Implementation' && n.properties.phase === 'Stalled');
    });
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = results.slice((page - 1) * limit, page * limit);

  res.json({ accounts: paginated, total, page, totalPages });
});

app.get('/api/accounts/:id/graph', (req, res) => {
  const accountId = req.params.id;
  const graphLayer = db.graphMap[accountId];
  if (graphLayer) res.json(graphLayer);
  else res.json({ nodes: [{ id: accountId, label: 'Account', properties: { name: `Unknown (${accountId})` } }], links: [] });
});

// AI Insights Router (LIVE LLM Integration)
app.get('/api/accounts/:id/insights', async (req, res) => {
  const accountId = req.params.id;
  const acc = db.accounts.find(a => a.id === accountId);
  const graph = db.graphMap[accountId];
  
  if (!acc) return res.status(404).json({ error: "Account not found" });

  const score = acc.health_score;
  const isCritical = score < 50;
  const nodes = graph ? graph.nodes : [];

  // ==========================================
  // 1. Attempt Live OpenAI Generation
  // ==========================================
  try {
    // We pass the exact node array structure as context to the AI
    const systemPrompt = `You are an expert RealPage Customer Success AI. Analyze the following property management company graph data.
    The user will provide a JSON array representing active nodes attached to this company.
    Node types you will see and their meaning:
    - Ticket (P1/P2): Open support cases. P1 = critical, P2 = serious.
    - BillingIssue: Unresolved billing anomaly.
    - Implementation: Active product onboarding. 'Stalled' phase = high risk.
    - Renewal: Contract renewal. 'At Risk' status + low days_to_renewal = regression factor for churn.
    - AccountPlan: Core vs. Non-Core classification. Non-Core = higher inherent risk.
    - HealthEvent: Open = active negative client health signal. Closed = resolved event in last 12 months.
    - RenewalChatter: Emails/chatter between client and Renewal Specialist from Salesforce Opportunity.
    - Cancellation: Cancellation record in last 12 months. Reason logged. Strong churn indicator.
    - PME: Problem Management Escalation sourced from Cases > P2 and PME. Open = active escalation.
    - CustomerMeeting: QBRs, check-ins, executive calls. Absence = low engagement signal.

    Health Score Regression Factors (per VP framework):
    - Non-Core classification → elevated churn risk
    - Renewal within 6 months → regression factor
    - Open HealthEvents in last 12 months → negative signal
    - P2 cases + open PME count → Open Activities signal
    - No recent CustomerMeeting (>90 days) → engagement gap
    - Cancellation history in last 12 months → strong churn signal

    You must output a strictly formatted JSON object with exactly these keys:
    - "risk_score": (integer) exactly ${score}.
    - "risk_band": (string) Choose either "Critical Risk", "High Risk", "Stable", or "Healthy".
    - "top_drivers": (array of strings) Bullet points explaining what is physically causing the risk based explicitly on the graph nodes.
    - "summary_text": (string) A highly intelligent, business-professional 2-3 sentence root cause executive summary.
    - "recommended_actions": (array of strings) 1-3 actionable business steps for the CSM, referencing specific VP framework signals (HealthEvents, PME, Renewal Chatter, etc.).
    `;

    const userMessage = `Analyze this graph node context: ${JSON.stringify(nodes.map(n => n.properties))}`;

    const completion = await openai.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Groq current recommended model — free & fast
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    // Overwrite the deterministic score just in case AI hallucinates a different one
    aiResponse.risk_score = score;
    // Enrich with Account Plan data (always derived deterministically from graph)
    aiResponse.account_plan = buildAccountPlan(nodes);
    return res.json(aiResponse);

  } catch (error) {
    // ==========================================
    // 2. The Hacker-Proof Algorithmic Fallback
    // ==========================================
    console.error("Groq Fallback Triggered! (Rate limit, Timeout, or Missing Key)", error.message);
    
    const p1Tickets = nodes.filter(n => n.label === 'Ticket' && n.properties.severity === 'P1').length;
    const billingIssues = nodes.filter(n => n.label === 'BillingIssue').length;
    const openHealthEvents = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Open').length;
    const openPME = nodes.filter(n => n.label === 'PME' && n.properties.status === 'Open').length;
    const cancellations = nodes.filter(n => n.label === 'Cancellation').length;
    const accountPlanNode = nodes.find(n => n.label === 'AccountPlan');
    const isNonCore = accountPlanNode?.properties?.classification === 'Non-Core';
    
    const drivers = [];
    if (p1Tickets > 0) drivers.push(`${p1Tickets} High-Severity P1 Ticket${p1Tickets > 1 ? 's' : ''} Open.`);
    if (billingIssues > 0) drivers.push(`Identified unresolved billing anomalies.`);
    if (openHealthEvents > 0) drivers.push(`${openHealthEvents} Open Client Health Event${openHealthEvents > 1 ? 's' : ''} logged in last 12 months.`);
    if (openPME > 0) drivers.push(`${openPME} Open Problem Management Escalation${openPME > 1 ? 's' : ''} (Cases > PME > Open Activities).`);
    if (cancellations > 0) drivers.push(`Cancellation on record in last 12 months — strong churn signal.`);
    if (isNonCore) drivers.push(`Non-Core account classification — elevated inherent churn risk.`);
    if (drivers.length === 0 && isCritical) drivers.push("Systemic low adoption or weak engagement patterns.");
    else if (!isCritical) drivers.push("Healthy engagement and product adoption.");

    return res.json({
      risk_score: score,
      risk_band: isCritical ? (score < 25 ? 'Critical Risk' : 'High Risk') : (score > 75 ? 'Healthy' : 'Stable'),
      top_drivers: drivers,
      summary_text: isCritical 
        ? `Analysis of the interaction graph for ${acc.name} indicates structural friction. The clustering of ${nodes.length} active incidents suggests a high probability of churn if not addressed immediately.`
        : `The knowledge graph for ${acc.name} shows a stable footprint. Current engagement patterns align with healthy enterprise benchmarks with no critical blockers detected.`,
      recommended_actions: isCritical 
        ? ["Execute immediate 'At-Risk' escalation protocol.", "Schedule emergency stakeholder alignment call.", "Review open PMEs and Health Events in Salesforce."]
        : ["Maintain standard rhythmic engagement.", "Review expansion opportunities in next QBR."],
      account_plan: buildAccountPlan(nodes)
    });
  }
});

function buildAccountPlan(nodes) {
  const apNode = nodes.find(n => n.label === 'AccountPlan');
  if (!apNode) return null;
  const openHE = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Open').length;
  const closedHE = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Closed').length;
  const hasCancellation = nodes.some(n => n.label === 'Cancellation');
  const pmeOpen = nodes.filter(n => n.label === 'PME' && n.properties.status === 'Open').length;
  const meetingNode = nodes.find(n => n.label === 'CustomerMeeting');
  return {
    classification: apNode.properties.classification,
    primary_solution: apNode.properties.primary_solution,
    secondary_solution: apNode.properties.secondary_solution,
    health_events_open: openHE,
    health_events_closed: closedHE,
    has_cancellation: hasCancellation,
    pme_open: pmeOpen,
    last_meeting: meetingNode ? meetingNode.properties.date : null
  };
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API running natively on http://localhost:${PORT}`));
