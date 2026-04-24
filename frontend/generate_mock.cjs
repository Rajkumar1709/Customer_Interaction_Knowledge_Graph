const fs = require('fs');

const COMPANY_PREFIXES = ["Greystar", "Winn", "Michaels", "Lindemann", "Lynd", "Abacus", "Crawford", "Nationwide", "Heritage Hill", "Pinnacle", "Sunrise", "Metro", "Oakridge", "BET", "Westcorp", "Hamilton", "Nusbaum", "Lincoln", "Bozzuto", "FPI", "Avenue5", "CWS", "Roscoe Properties"];
const COMPANY_SUFFIXES = ["Management Services, LLC", "Residential Corp", "Realty Company", "Investments", "Communities", "Property Management", "Capital Group", "Multifamily Management", "Properties", "Realty Group"];
const RP_PRODUCTS = ["OneSite", "YieldStar", "ActiveBuilding", "Kigo", "Buildium", "LeaseStar", "CommunityConnect", "RealPage Analytics"];
const OWNERS = ["Lauren Neal", "Jennifer Stout", "Hilliard Sumner", "Titina Ott-Adams", "Marcus Webb"];
const RENEWAL_SPECIALISTS = ["Amanda Torres", "Kevin Marsh", "Diana Chen", "Robert Sloane"];
const CANCEL_REASONS = ["Price/Cost Concerns", "Switching to Competitor", "Consolidating Vendors", "Feature Gaps", "Poor Support Experience", "Company Downsizing"];
const PME_TITLES = ["Escalation: Data Sync Failure", "Problem: Lease Workflow Blocked", "Escalation: Reporting Outage", "Problem: Integration Timeout", "Escalation: Bulk Upload Error"];
const MEETING_TITLES = ["Quarterly Business Review", "Executive Check-in", "Renewal Strategy Call", "Product Roadmap Review", "At-Risk Intervention", "Onboarding Kickoff"];
const HEALTH_EVENT_DESCRIPTIONS = [
  "Client flagged concerns about platform stability during peak leasing season.",
  "Executive sponsor expressed frustration over unresolved billing disputes.",
  "CSM identified declining login frequency and product adoption drop.",
  "Client requested emergency call due to data sync errors impacting rent roll.",
  "Positive milestone: Client expanded portfolio and renewed ahead of schedule."
];
const CHATTER_SUBJECTS = [
  "RE: Renewal Proposal – Action Required",
  "Following up on contract terms discussion",
  "Updated pricing for upcoming term",
  "Renewal call recap + next steps",
  "Contract addendum — please review"
];
const SOLUTIONS = ["OneSite L&R", "OneSite Leasing", "YieldStar Revenue Mgmt", "ActiveBuilding Resident Portal", "LeaseStar Marketing", "RealPage Analytics+"];

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(monthsBack) {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(1, monthsBack * 30));
  return d.toISOString().split('T')[0];
}

const accounts = [];
const graphMap = {};

// ─── A-100: Oakridge (the "WOW" demo account) ───────────────────────────
// DESIGN RULE: Properties are NOT individual nodes.
//   → Only ONE "Portfolio" summary node shows the total property count.
//   → Only specific properties that HAVE a direct issue are surfaced as named nodes.
accounts.push({ id: "A-100", name: "Oakridge Residential Group", health_score: 25, segment: "Enterprise", owner: "Lauren Neal", arr_acv: 150000, property_count: 347 });
graphMap["A-100"] = {
  nodes: [
    { id: 'A-100',    label: 'Account',          properties: { name: 'Oakridge', segment: 'Enterprise' } },
    { id: 'PORT-100', label: 'Portfolio',         properties: { name: 'Portfolio', total_properties: 347, affected: 2 } },
    { id: 'PR-OS',    label: 'Product',           properties: { name: 'OneSite', type: 'Leasing Platform' } },
    { id: 'PR-YS',    label: 'Product',           properties: { name: 'YieldStar', type: 'Revenue Mgmt' } },
    { id: 'T-501',    label: 'Ticket',            properties: { status: 'Open', severity: 'P1', subject: 'Rent roll sync failure – OneSite' } },
    { id: 'T-502',    label: 'Ticket',            properties: { status: 'Open', severity: 'P2', subject: 'Charge code mismatch – bulk posting' } },
    { id: 'T-503',    label: 'Ticket',            properties: { status: 'Open', severity: 'P2', subject: 'Batch report timeout – YieldStar' } },
    { id: 'B-911',    label: 'BillingIssue',      properties: { amount: 5400, status: 'Overdue', overdue_days: 45 } },
    { id: 'IMP-001',  label: 'Implementation',    properties: { phase: 'Stalled', product: 'ActiveBuilding', delay_days: 32 } },
    { id: 'R-001',    label: 'Renewal',           properties: { status: 'At Risk', days_to_renewal: 28 } },
    // ── NEW: VP Health Score Framework nodes ────────────────────────────
    { id: 'AP-100',   label: 'AccountPlan',       properties: { classification: 'Core', primary_solution: 'OneSite L&R', secondary_solution: 'YieldStar Revenue Mgmt', arr: 150000, csm_owner: 'Lauren Neal' } },
    { id: 'HE-100-1', label: 'HealthEvent',       properties: { status: 'Open', description: 'Client flagged concerns about platform stability during peak leasing season.', date: '2026-03-15', week_update: 'CSM scheduled emergency call. Executive sponsor engaged. Awaiting engineering resolution ETA.' } },
    { id: 'HE-100-2', label: 'HealthEvent',       properties: { status: 'Closed', description: 'Executive sponsor expressed frustration over unresolved billing disputes.', date: '2025-10-08', week_update: 'Billing dispute resolved. Credit issued. Sponsor confirmed satisfaction.' } },
    { id: 'RC-100-1', label: 'RenewalChatter',    properties: { from: 'Amanda Torres', to: 'Lauren Neal', subject: 'RE: Renewal Proposal – Action Required', date: '2026-04-01', snippet: 'Client has not responded to the renewal proposal sent 2 weeks ago. Follow-up urgently needed before the 28-day window closes.' } },
    { id: 'RC-100-2', label: 'RenewalChatter',    properties: { from: 'Lauren Neal', to: 'Amanda Torres', subject: 'Renewal call recap + next steps', date: '2026-03-22', snippet: 'Call went well. Client open to renewal but wants pricing concession. Escalating to leadership for approval.' } },
    { id: 'PME-100-1',label: 'PME',               properties: { title: 'Escalation: Data Sync Failure', status: 'Open', created_date: '2026-02-10', escalation_level: 'P2', assigned_to: 'Hilliard Sumner' } },
    { id: 'CM-100-1', label: 'CustomerMeeting',   properties: { title: 'Quarterly Business Review', date: '2026-01-18', attendees: 'Lauren Neal, VP Client, IT Director', notes: 'Client raised concerns about OneSite performance. Agreed to monthly check-ins until issue resolved.' } },
    { id: 'CM-100-2', label: 'CustomerMeeting',   properties: { title: 'At-Risk Intervention', date: '2026-03-20', attendees: 'Lauren Neal, Hilliard Sumner, VP Client', notes: 'Emergency meeting triggered by open P1 ticket and stalled implementation. Action plan drafted.' } },
  ],
  links: [
    { source: 'A-100',    target: 'PORT-100',  type: 'HAS_PORTFOLIO' },
    { source: 'A-100',    target: 'PR-OS',     type: 'USES_PRODUCT' },
    { source: 'A-100',    target: 'PR-YS',     type: 'USES_PRODUCT' },
    { source: 'A-100',    target: 'T-501',     type: 'HAS_TICKET' },
    { source: 'A-100',    target: 'T-502',     type: 'HAS_TICKET' },
    { source: 'A-100',    target: 'T-503',     type: 'HAS_TICKET' },
    { source: 'PR-OS',    target: 'T-501',     type: 'PRODUCT_ISSUE' },
    { source: 'PR-YS',    target: 'T-503',     type: 'PRODUCT_ISSUE' },
    { source: 'A-100',    target: 'B-911',     type: 'HAS_BILLING_ISSUE' },
    { source: 'A-100',    target: 'IMP-001',   type: 'HAS_IMPLEMENTATION' },
    { source: 'A-100',    target: 'R-001',     type: 'HAS_RENEWAL' },
    // NEW links
    { source: 'A-100',    target: 'AP-100',    type: 'HAS_ACCOUNT_PLAN' },
    { source: 'A-100',    target: 'HE-100-1',  type: 'HAS_HEALTH_EVENT' },
    { source: 'A-100',    target: 'HE-100-2',  type: 'HAS_HEALTH_EVENT' },
    { source: 'R-001',    target: 'RC-100-1',  type: 'HAS_CHATTER' },
    { source: 'R-001',    target: 'RC-100-2',  type: 'HAS_CHATTER' },
    { source: 'A-100',    target: 'PME-100-1', type: 'HAS_PME' },
    { source: 'A-100',    target: 'CM-100-1',  type: 'HAS_MEETING' },
    { source: 'A-100',    target: 'CM-100-2',  type: 'HAS_MEETING' },
  ]
};

// ─── Generate 1499 more PMCs ─────────────────────────────────────────────
for (let i = 101; i <= 1600; i++) {
  const cId = `A-${i}`;
  const health = randomInt(15, 95);
  const isCritical = health < 50;
  const propCount = health > 70 ? randomInt(50, 500) : randomInt(5, 100); // realistic portfolio size
  const companyName = `${randomChoice(COMPANY_PREFIXES)} ${randomChoice(COMPANY_SUFFIXES)}`;

  accounts.push({
    id: cId,
    name: companyName,
    health_score: health,
    segment: health > 70 ? "Enterprise" : health > 40 ? "Mid-Market" : "SMB",
    owner: randomChoice(OWNERS),
    arr_acv: randomInt(5000, 250000),
    property_count: propCount
  });

  const nodes = [{ id: cId, label: 'Account', properties: { name: companyName } }];
  const links = [];

  // ── Portfolio summary node (always 1, no individual property nodes) ──────
  const affectedProps = isCritical ? randomInt(1, 5) : 0;
  nodes.push({
    id: `PORT-${cId}`,
    label: 'Portfolio',
    properties: { name: 'Portfolio', total_properties: propCount, affected: affectedProps }
  });
  links.push({ source: cId, target: `PORT-${cId}`, type: 'HAS_PORTFOLIO' });

  const usedProducts = new Set();
  const prodCount = randomInt(1, 2);
  for (let pr = 0; pr < prodCount; pr++) {
    let prod;
    do { prod = randomChoice(RP_PRODUCTS); } while (usedProducts.has(prod));
    usedProducts.add(prod);
    const prId = `PR-${cId}-${pr}`;
    nodes.push({ id: prId, label: 'Product', properties: { name: prod, type: 'Platform' } });
    links.push({ source: cId, target: prId, type: 'USES_PRODUCT' });
  }

  if (isCritical) {
    // Ticket
    if (Math.random() < 0.75) {
      const tId = `T-${cId}-1`;
      nodes.push({ id: tId, label: 'Ticket', properties: { status: 'Open', severity: Math.random() < 0.4 ? 'P1' : 'P2', subject: 'Support escalation' } });
      links.push({ source: cId, target: tId, type: 'HAS_TICKET' });
    }
    // Billing
    if (Math.random() < 0.55) {
      const bId = `B-${cId}-1`;
      nodes.push({ id: bId, label: 'BillingIssue', properties: { amount: randomInt(1000, 15000), status: 'Overdue', overdue_days: randomInt(15, 90) } });
      links.push({ source: cId, target: bId, type: 'HAS_BILLING_ISSUE' });
    }
    // Stalled implementation
    if (Math.random() < 0.3) {
      const iId = `IMP-${cId}-1`;
      nodes.push({ id: iId, label: 'Implementation', properties: { phase: 'Stalled', product: randomChoice(RP_PRODUCTS), delay_days: randomInt(5, 60) } });
      links.push({ source: cId, target: iId, type: 'HAS_IMPLEMENTATION' });
    }
    // Risky Renewal
    const rRiskyId = `R-${cId}-1`;
    nodes.push({ id: rRiskyId, label: 'Renewal', properties: { status: 'At Risk', days_to_renewal: randomInt(10, 60) } });
    links.push({ source: cId, target: rRiskyId, type: 'HAS_RENEWAL' });
    // RenewalChatter (critical accounts always have chatter)
    const rcId = `RC-${cId}-1`;
    nodes.push({ id: rcId, label: 'RenewalChatter', properties: { from: randomChoice(RENEWAL_SPECIALISTS), to: randomChoice(OWNERS), subject: randomChoice(CHATTER_SUBJECTS), date: randomDate(3), snippet: 'Client has not confirmed renewal. Pricing discussion ongoing. Escalation may be needed.' } });
    links.push({ source: rRiskyId, target: rcId, type: 'HAS_CHATTER' });
    // PME (Problem Management Escalation) — 60% of critical accounts
    if (Math.random() < 0.6) {
      const pmeId = `PME-${cId}-1`;
      nodes.push({ id: pmeId, label: 'PME', properties: { title: randomChoice(PME_TITLES), status: 'Open', created_date: randomDate(12), escalation_level: Math.random() < 0.4 ? 'P1' : 'P2', assigned_to: randomChoice(OWNERS) } });
      links.push({ source: cId, target: pmeId, type: 'HAS_PME' });
    }
    // HealthEvent (open) — critical accounts
    if (Math.random() < 0.7) {
      const heId = `HE-${cId}-1`;
      nodes.push({ id: heId, label: 'HealthEvent', properties: { status: 'Open', description: randomChoice(HEALTH_EVENT_DESCRIPTIONS), date: randomDate(6), week_update: 'CSM engaged. Issue under investigation. Executive sponsor notified.' } });
      links.push({ source: cId, target: heId, type: 'HAS_HEALTH_EVENT' });
    }
    // Cancellation history — 20% of critical accounts
    if (Math.random() < 0.2) {
      const canId = `CAN-${cId}-1`;
      nodes.push({ id: canId, label: 'Cancellation', properties: { reason: randomChoice(CANCEL_REASONS), date: randomDate(12), product: randomChoice(RP_PRODUCTS) } });
      links.push({ source: cId, target: canId, type: 'HAD_CANCELLATION' });
    }
  } else {
    nodes.push({ id: `R-${cId}-2`, label: 'Renewal', properties: { status: 'Healthy', days_to_renewal: randomInt(120, 365) } });
    links.push({ source: cId, target: `R-${cId}-2`, type: 'HAS_RENEWAL' });
    // HealthEvent (closed) — healthy accounts show resolved events in last 12 months
    if (Math.random() < 0.45) {
      const heId2 = `HE-${cId}-2`;
      nodes.push({ id: heId2, label: 'HealthEvent', properties: { status: 'Closed', description: randomChoice(HEALTH_EVENT_DESCRIPTIONS), date: randomDate(12), week_update: 'Issue resolved. Client confirmed satisfaction. Health restored.' } });
      links.push({ source: cId, target: heId2, type: 'HAS_HEALTH_EVENT' });
    }
    // RenewalChatter — 30% of healthy accounts still have ongoing chatter
    if (Math.random() < 0.3) {
      const rHealthyId = `R-${cId}-2`;
      const rcHId = `RC-${cId}-2`;
      nodes.push({ id: rcHId, label: 'RenewalChatter', properties: { from: randomChoice(RENEWAL_SPECIALISTS), to: randomChoice(OWNERS), subject: 'Renewal confirmation and contract addendum', date: randomDate(2), snippet: 'Client confirmed renewal. Final contract addendum being prepared by legal team.' } });
      links.push({ source: rHealthyId, target: rcHId, type: 'HAS_CHATTER' });
    }
  }

  // AccountPlan — every account has one
  const apId = `AP-${cId}`;
  const isCore = health > 50 || Math.random() < 0.4; // core if healthy or 40% chance even if at-risk
  nodes.push({ id: apId, label: 'AccountPlan', properties: { classification: isCore ? 'Core' : 'Non-Core', primary_solution: randomChoice(SOLUTIONS), secondary_solution: Math.random() < 0.5 ? randomChoice(SOLUTIONS) : 'N/A', arr: randomInt(5000, 250000), csm_owner: randomChoice(OWNERS) } });
  links.push({ source: cId, target: apId, type: 'HAS_ACCOUNT_PLAN' });

  // CustomerMeeting — every account has at least 1
  const cmId = `CM-${cId}-1`;
  const daysAgo = isCritical ? randomInt(5, 90) : randomInt(5, 180);
  nodes.push({ id: cmId, label: 'CustomerMeeting', properties: { title: randomChoice(MEETING_TITLES), date: randomDate(6), attendees: `${randomChoice(OWNERS)}, Client Executive`, notes: isCritical ? 'Account flagged as at-risk. Action plan discussed.' : 'Regular engagement. Client satisfied with current progress.' } });
  links.push({ source: cId, target: cmId, type: 'HAS_MEETING' });

  graphMap[cId] = { nodes, links };
}

const db = { accounts, graphMap };
fs.mkdirSync('./src/data', { recursive: true });
fs.writeFileSync('./src/data/mockDb.json', JSON.stringify(db));
console.log(`Generated ${accounts.length} PMCs with smart portfolio aggregation!`);
