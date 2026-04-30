require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

// BigQuery Integration Modules
const bqQueries = require('./queries');
const { calculateHealthScore } = require('./healthScore');
const { isReady: bqReady } = require('./bigquery');
const { generateAccountIntelligence, answerGraphQuestion, analyzeNodeGroup } = require('./customerIntelligence');

const { getCache, setCache } = require('./cache');

const app = express();
app.use(cors());
app.use(express.json());

// ----------------------------------------------------
// Caching Middleware (Speeds up repeated API requests)
// ----------------------------------------------------
app.use('/api', (req, res, next) => {
  const isPost = req.method === 'POST';
  // Create a unique cache key based on URL and Body (for POST requests)
  const cacheKey = req.originalUrl + (isPost ? '_' + JSON.stringify(req.body) : '');
  
  const cachedData = getCache(cacheKey);
  if (cachedData) {
    console.log(`[Cache] ⚡ HIT: ${req.originalUrl}`);
    return res.json(cachedData);
  }
  
  // Hook res.json to save the response to cache before sending
  const originalJson = res.json.bind(res);
  res.json = (body) => {
    // Cache for 5 minutes (ignoring errors)
    if (!body.error && body.success !== false) {
      setCache(cacheKey, body);
    }
    originalJson(body);
  };
  next();
});

// Initialize OpenAI client using the Hackathon provided key
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Load the 1500 simulated PMC Graph Database (Fallback Mechanism)
let db = { accounts: [], graphMap: {} };
try {
  const dbPath = path.join(__dirname, '../frontend/src/data/mockDb.json');
  const rawData = fs.readFileSync(dbPath);
  db = JSON.parse(rawData);
  console.log(`[MockDB] ✅ Loaded ${db.accounts.length} PMCs into memory.`);
} catch (e) {
  console.error("[MockDB] Warning: mockDb.json not found.");
}

// ----------------------------------------------------
// 1. Account Search (Dual-Source)
// ----------------------------------------------------
app.get('/api/accounts/search', async (req, res) => {
  const query = (req.query.q || '').toLowerCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 150;
  const risky = req.query.risky === 'true';
  const core = req.query.core === 'true';
  const nonCore = req.query.nonCore === 'true';

  let results = [];
  let usedBigQuery = false;

  // Attempt BigQuery First
  if (process.env.USE_BIGQUERY === 'true' && bqReady) {
    try {
      results = await bqQueries.searchAccounts(query, limit * page, { risky, core, nonCore });
      usedBigQuery = true;
      console.log(`[Search] Fetched from BigQuery. Query: "${query}"`);
    } catch (err) {
      console.error("[Search] ⚠️ BigQuery fallback triggered:", err.message);
    }
  }

  // Graceful Fallback to Mock Data (Only runs if BQ is disabled or fails)
  if (!usedBigQuery) {
    results = db.accounts;
    if (query) {
      results = results.filter(acc =>
        acc.name.toLowerCase().includes(query) || acc.id.toLowerCase().includes(query)
      );
    }
  }

  // Filter: Show Risky Accounts (Runs for both BQ and Mock because health_score is already calculated)
  if (risky) {
    results = results.filter(acc => acc.health_score < 50);
  }

  // Filter: Core Accounts (mock data fallback)
  if (core && !usedBigQuery) {
    results = results.filter(acc => {
      const graph = db.graphMap[acc.id];
      return graph?.nodes?.some(n => n.label === 'Account' && n.properties.is_core === true);
    });
  }

  // Filter: Non-Core Accounts (mock data fallback)
  if (nonCore && !usedBigQuery) {
    results = results.filter(acc => {
      const graph = db.graphMap[acc.id];
      return graph?.nodes?.some(n => n.label === 'Account' && n.properties.is_core === false);
    });
  }

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const paginated = results.slice((page - 1) * limit, page * limit);

  res.json({ accounts: paginated, total, page, totalPages, source: usedBigQuery ? 'BigQuery' : 'MockData' });
});

// ----------------------------------------------------
// 2. Graph Nodes (Dual-Source)
// ----------------------------------------------------
app.get('/api/accounts/:id/graph', async (req, res) => {
  const accountId = req.params.id;
  let graphLayer = null;
  let usedBigQuery = false;

  if (process.env.USE_BIGQUERY === 'true' && bqReady) {
    try {
      graphLayer = await bqQueries.getAccountGraph(accountId);
      usedBigQuery = true;
      console.log(`[Graph] Fetched nodes for ${accountId} from BigQuery.`);
    } catch (err) {
      console.error(`[Graph] ⚠️ BigQuery fallback triggered for ${accountId}:`, err.message);
    }
  }

  if (!usedBigQuery) {
    graphLayer = db.graphMap[accountId];
  }

  if (graphLayer) res.json(graphLayer);
  else res.json({ nodes: [{ id: accountId, label: 'Account', properties: { name: `Unknown (${accountId})` } }], links: [] });
});

// ----------------------------------------------------
// 3. AI Insights (Dual-Source Context)
// ----------------------------------------------------
app.get('/api/accounts/:id/insights', async (req, res) => {
  const accountId = req.params.id;
  
  let accName = `Account ${accountId}`;
  let score = 85;
  let nodes = [];
  let usedBigQuery = false;

  // Extract Context from BigQuery if enabled
  if (process.env.USE_BIGQUERY === 'true' && bqReady) {
    try {
      const graphData = await bqQueries.getAccountGraph(accountId);
      nodes = graphData.nodes;
      const accNode = nodes.find(n => n.label === 'Account');
      if (accNode) {
        accName = accNode.properties.name;
        if (accNode.properties.health_score !== undefined) {
          score = accNode.properties.health_score;
        } else {
          score = calculateHealthScore(nodes);
        }
      }
      
      usedBigQuery = true;
      console.log(`[Insights] Generating insights using BigQuery context for ${accountId}.`);
    } catch (err) {
      console.error(`[Insights] ⚠️ BigQuery fallback triggered for ${accountId}:`, err.message);
    }
  }

  // Fallback Context
  if (!usedBigQuery) {
    const acc = db.accounts.find(a => a.id === accountId);
    if (!acc) return res.status(404).json({ error: "Account not found" });
    accName = acc.name;
    score = acc.health_score;
    const graph = db.graphMap[accountId];
    nodes = graph ? graph.nodes : [];
  }

  const isCritical = score < 50;

  // ==========================================
  // Attempt Live AI Generation via Groq
  // ==========================================
  try {
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
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    aiResponse.risk_score = score;
    aiResponse.account_plan = buildAccountPlan(nodes);
    return res.json(aiResponse);

  } catch (error) {
    // ==========================================
    // The Hacker-Proof Algorithmic Fallback
    // ==========================================
    console.error("Groq Fallback Triggered! (Rate limit, Timeout, or Missing Key)", error.message);
    
    const p1Tickets = nodes.filter(n => n.label === 'Ticket' && n.properties.severity === 'P1').length;
    const billingIssues = nodes.filter(n => n.label === 'BillingIssue').length;
    const openHealthEvents = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Open').length;
    const openPME = nodes.filter(n => n.label === 'PME' && (n.properties.status === 'Open' || n.properties.status === 'New')).length;
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
        ? `Analysis of the interaction graph for ${accName} indicates structural friction. The clustering of ${nodes.length} active incidents suggests a high probability of churn if not addressed immediately.`
        : `The knowledge graph for ${accName} shows a stable footprint. Current engagement patterns align with healthy enterprise benchmarks with no critical blockers detected.`,
      recommended_actions: isCritical 
        ? ["Execute immediate 'At-Risk' escalation protocol.", "Schedule emergency stakeholder alignment call.", "Review open PMEs and Health Events in Salesforce."]
        : ["Maintain standard rhythmic engagement.", "Review expansion opportunities in next QBR."],
      account_plan: buildAccountPlan(nodes)
    });
  }
});

// ----------------------------------------------------
// 4. Enhanced AI Intelligence (360 Briefing, Insights, Roles, Timeline)
// ----------------------------------------------------
app.get('/api/accounts/:id/intelligence', async (req, res) => {
  const accountId = req.params.id;
  
  let accName = `Account ${accountId}`;
  let score = 85;
  let nodes = [];
  let usedBigQuery = false;

  // Extract Context
  if (process.env.USE_BIGQUERY === 'true' && bqReady) {
    try {
      const graphData = await bqQueries.getAccountGraph(accountId);
      nodes = graphData.nodes;
      const accNode = nodes.find(n => n.label === 'Account');
      if (accNode) {
        accName = accNode.properties.name;
        if (accNode.properties.health_score !== undefined) {
          score = accNode.properties.health_score;
        } else {
          score = calculateHealthScore(nodes);
        }
      }
      usedBigQuery = true;
    } catch (err) {
      console.error(`[Intelligence] BigQuery fallback for ${accountId}:`, err.message);
    }
  }

  if (!usedBigQuery) {
    const acc = db.accounts.find(a => a.id === accountId);
    if (!acc) return res.status(404).json({ error: "Account not found" });
    accName = acc.name;
    score = acc.health_score;
    const graph = db.graphMap[accountId];
    nodes = graph ? graph.nodes : [];
  }

  const result = await generateAccountIntelligence(accountId, accName, score, nodes);
  if (result.success) {
    result.data.account_plan = buildAccountPlan(nodes);
    res.json(result.data);
  } else {
    // Fallback if LLM fails
    res.status(500).json({ 
      error: "AI generation failed", 
      timeline: result.timeline,
      risk_score: score,
      account_plan: buildAccountPlan(nodes)
    });
  }
});

// ----------------------------------------------------
// 5. Ask Anything (Natural Language Q&A)
// ----------------------------------------------------
app.post('/api/accounts/:id/qa', async (req, res) => {
  const accountId = req.params.id;
  const { question } = req.body;
  if (!question) return res.status(400).json({ error: "Question is required" });

  let accName = `Account ${accountId}`;
  let nodes = [];
  let usedBigQuery = false;

  if (process.env.USE_BIGQUERY === 'true' && bqReady) {
    try {
      const graphData = await bqQueries.getAccountGraph(accountId);
      nodes = graphData.nodes;
      const accNode = nodes.find(n => n.label === 'Account');
      if (accNode) accName = accNode.properties.name;
      usedBigQuery = true;
    } catch (err) {}
  }

  if (!usedBigQuery) {
    const acc = db.accounts.find(a => a.id === accountId);
    if (acc) accName = acc.name;
    const graph = db.graphMap[accountId];
    nodes = graph ? graph.nodes : [];
  }

  const result = await answerGraphQuestion(accName, nodes, question);
  res.json(result);
});

// ----------------------------------------------------
// 6. Node-Specific AI Analysis
// ----------------------------------------------------
app.post('/api/nodes/analyze', async (req, res) => {
  const { label, items } = req.body;
  if (!label || !items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Label and items array are required" });
  }

  const result = await analyzeNodeGroup(label, items);
  res.json(result);
});

function buildAccountPlan(nodes) {
  const apNode = nodes.find(n => n.label === 'AccountPlan');
  if (!apNode) return null;
  const openHE = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Open').length;
  const closedHE = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Closed').length;
  const cancellations = nodes.filter(n => n.label === 'Cancellation').length;
  const pmeOpen = nodes.filter(n => n.label === 'PME' && (n.properties.status === 'Open' || n.properties.status === 'New')).length;
  const meetingNode = nodes.find(n => n.label === 'CustomerMeeting');
  
  const p1Tickets = nodes.filter(n => n.label === 'Ticket' && n.properties.severity && n.properties.severity.startsWith('P1')).length;
  const p2Tickets = nodes.filter(n => n.label === 'Ticket' && n.properties.severity && n.properties.severity.startsWith('P2')).length;
  const stalledImpl = nodes.filter(n => n.label === 'Implementation' && n.properties.phase === 'Stalled').length;
  const isNonCore = apNode.properties.classification === 'Non-Core';

  const breakdown = [];
  breakdown.push({ factor: 'Base Score', impact: '+100' });
  if (p1Tickets > 0) breakdown.push({ factor: `${p1Tickets} P1 Ticket(s)`, impact: `-${p1Tickets * 15}` });
  if (p2Tickets > 0) breakdown.push({ factor: `${p2Tickets} P2 Ticket(s)`, impact: `-${p2Tickets * 8}` });
  if (openHE > 0) breakdown.push({ factor: `${openHE} Open Health Event(s)`, impact: `-${openHE * 10}` });
  if (pmeOpen > 0) breakdown.push({ factor: `${pmeOpen} Open PME(s)`, impact: `-${pmeOpen * 12}` });
  if (stalledImpl > 0) breakdown.push({ factor: `${stalledImpl} Stalled Implementation(s)`, impact: `-${stalledImpl * 10}` });
  if (cancellations > 0) breakdown.push({ factor: 'Cancellation History', impact: '-20' });
  if (isNonCore) breakdown.push({ factor: 'Non-Core Account', impact: '-10' });

  return {
    classification: apNode.properties.classification,
    primary_solution: apNode.properties.primary_solution,
    secondary_solution: apNode.properties.secondary_solution,
    health_events_open: openHE,
    health_events_closed: closedHE,
    has_cancellation: cancellations > 0,
    pme_open: pmeOpen,
    last_meeting: meetingNode ? meetingNode.properties.date : null,
    score_breakdown: breakdown
  };
}

// ----------------------------------------------------
// 7. Serve React Frontend (Single-Service Deployment)
// ----------------------------------------------------
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  console.log(`[Server] Serving static frontend from: ${frontendDistPath}`);
  app.use(express.static(frontendDistPath));
  
  // Catch-all route to serve index.html for React Router
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) return res.status(404).json({ error: 'API route not found' });
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`API running natively on http://localhost:${PORT}`));
