/**
 * Implements the VP Health Score Framework based on BigQuery graph nodes.
 * Base score is 100. Deductions are applied based on negative signals.
 */
function calculateHealthScore(nodes) {
  let score = 100;

  const p1Tickets = nodes.filter(n => n.label === 'Ticket' && n.properties.severity && n.properties.severity.startsWith('P1')).length;
  const p2Tickets = nodes.filter(n => n.label === 'Ticket' && n.properties.severity && n.properties.severity.startsWith('P2')).length;
  const openHealthEvents = nodes.filter(n => n.label === 'HealthEvent' && n.properties.status === 'Open').length;
  const openPME = nodes.filter(n => n.label === 'PME' && (n.properties.status === 'Open' || n.properties.status === 'New')).length;
  const cancellations = nodes.filter(n => n.label === 'Cancellation').length;
  const stalledImpl = nodes.filter(n => n.label === 'Implementation' && n.properties.phase === 'Stalled').length;
  
  const accountPlanNode = nodes.find(n => n.label === 'AccountPlan');
  const isNonCore = accountPlanNode?.properties?.classification === 'Non-Core';

  // Deductions
  score -= (p1Tickets * 15);
  score -= (p2Tickets * 8);
  score -= (openHealthEvents * 10);
  score -= (openPME * 12);
  score -= (stalledImpl * 10);
  
  if (cancellations > 0) score -= 20;
  if (isNonCore) score -= 10;

  // Floor at 0
  return Math.max(0, score);
}

module.exports = { calculateHealthScore };
