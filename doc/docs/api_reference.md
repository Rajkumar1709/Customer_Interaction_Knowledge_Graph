# API Reference

The Python backend exposes the following RESTful endpoints to feed the Knowledge Graph UI.

## Endpoints

1. `GET /accounts/search?q=`
   - Returns matching PMCs or Accounts.
2. `GET /accounts/{account_id}`
   - Returns the high-level account summary.
3. `GET /accounts/{account_id}/graph`
   - Returns nodes and edges required for rendering the D3/Vis.js interactive graph.
4. `GET /accounts/{account_id}/insights`
   - Returns the calculated risk score, risk factors, AI summary, and generated recommendations.
5. `POST /ingest/sample-data`
   - Bulk loads sample datasets into Neo4j.
6. `POST /links/manual`
   - Allows user-added relationship/context (CSM Human overlay).

## Application Flow

```mermaid
sequenceDiagram
    participant CSM as User (CSM)
    participant UI as Frontend React
    participant API as Backend FastAPI
    participant AI as AI/Risk Service
    participant DB as Neo4j

    CSM->>UI: Selects "Oakridge Residential"
    UI->>API: GET /accounts/123/graph
    API->>DB: Cypher Query (Find all related nodes)
    DB-->>API: Subgraph Data (Nodes/Edges)
    API-->>UI: Graph JSON
    UI-->>CSM: Renders Knowledge Graph

    UI->>API: GET /accounts/123/insights
    API->>AI: Fetch Risk Score
    AI->>DB: Query open P1s, billing, renewals
    DB-->>AI: Aggregate metrics
    AI->>LLM: Generate Account Summary & Next Actions
    LLM-->>AI: Root Cause Narrative text
    AI-->>API: Insight JSON
    API-->>UI: Risk JSON Response
    UI-->>CSM: Renders Insight Panel & Actions
```
