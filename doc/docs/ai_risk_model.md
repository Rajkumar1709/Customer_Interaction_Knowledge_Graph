# AI & Risk Model

Our goal is to keep the AI model simple, explainable, and highly credible for a demo. We explicitly frame this as **“AI-assisted risk scoring”** rather than a "fully predictive churn model".

## 1. Risk Scoring Engine

By querying the Knowledge Graph, we sum risk across different incident types to calculate an overall account risk score.

### Example Scoring Weights
- **Unresolved P1/P2 Ticket**: `+25`
- **Unresolved Billing Issue**: `+20`
- **Negative Sentiment Interaction**: `+15`
- **Renewal within 45 Days**: `+25`
- **Implementation Blocker**: `+15`
- **Executive Escalation**: `+20`

### Risk Bands
- **0–24**: Low
- **25–49**: Medium
- **50–79**: High
- **80+**: Critical

## 2. Generative AI Capabilities

Instead of a complex LangChain setup for the MVP, we use structured prompting based on the output of the Graph DB.

### Account Summary
Prompt AI with structured account signals to:
1. Summarize account health.
2. Identify top risk drivers.
3. Recommend next actions.

### Root-Cause Narrative
**Example AI Output:**
> "This account appears high-risk primarily due to the combination of 3 unresolved P2 support issues, a recent billing dispute, and an upcoming renewal in 28 days. The linked implementation delay suggests the issues may be systemic across properties rather than isolated."

### Prompt Design Template

```text
You are analyzing customer account health for RealPage Customer Success.
Given the following structured signals for one account:
- Account name: Oakridge Residential Group
- Renewal in: 28 days
- Open tickets: 3
- Escalations: 1
- Billing disputes: 1
- Recent interaction sentiment: negative
- Implementation blocker: yes

Write:
1. A 3-sentence summary of account health
2. Top 3 risk drivers
3. 3 recommended next actions

Keep the response concise, business-friendly, and explainable.
```
