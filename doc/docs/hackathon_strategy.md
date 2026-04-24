# Hackathon Execution Strategy

## Build Sequence by Day

### Day 1: Foundation
- Finalize the specific use case and align with the Hackathon Charter.
- Define Neo4j Data Model.
- Generate sample CSV data.
- Scaffold React and Python codebases.

### Day 2: Graph + APIs
- Ingest sample data into Neo4j.
- Build the account graph `/graph` endpoint.
- Connect the frontend Vis.js/React-Force-Graph library to render the graph.

### Day 3: Intelligence Layer
- Implement risk scoring algorithm.
- Build AI summary endpoint (GPT integration).
- Create insight cards and filters on the UI.

### Day 4: Demo Hardening
- Improve UX / CSS.
- Script the exact click-path demo.
- Create backup screenshots and screen recordings in case the live environment drops.

## The Pitch (What Judges Want)

- **Problem**: RealPage teams (Sales, Success, Support) cannot see the full customer context. Salesforce and OMS are siloed.
- **Insight**: The missing value is in the *relationships* between signals, not just the rows themselves.
- **Solution**: A graph-based intelligence layer that surfaces hidden risk across functions and explains it simply.
- **Impact**: Aligning with "Project Next", we can cut PME backlog by up to 5% proactively and lower MTTR by 10%.
- **Unique Selling Proposition (USP)**: We allow CSMs to add human context overlays into the AI loop. AI handles structured signals; humans add qualitative insight. Together they prevent churn.
