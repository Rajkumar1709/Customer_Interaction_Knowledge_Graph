# Data & Demo Plan

To prove the value of the intelligence layer without getting bogged down in "enterprise-grade permissions" or "messy production entity resolution", we use realistic **Synthetic Data**.

## Demo Setup (4 Accounts)

We will load a CSV-based dataset that seeds the graph with specific pre-planned scenarios.

### 1. The Risky Account (Oakridge Residential)
Designed to glow red on the dashboard.
- 3 Unresolved Support Tickets
- 1 Billing Dispute
- Negative Call Summary (Clari data)
- Renewal coming in 30 days
- Implementation delay at one property

### 2. The Healthy Account
- Smooth renewals, high adoption, no P1 tickets.

### 3. The Medium-Risk Account
- Escalation resolved recently, slow adoption.

### 4. Noisy but Low-Risk Account
- High volume of "How-to" tickets (P4), but billing is current and sentiment is positive.
- *Proves the AI doesn't just look at row counts.*

## Visual Graph Polish

- **Account** = Blue
- **Ticket** = Orange
- **Billing Issue** = Red
- **Renewal** = Purple
- **Interaction** = Yellow
- **Product** = Green
- **Property** = Teal

**Risk Highlighting:**
- Red glow for critical nodes.
- Larger size for highly connected hubs.
