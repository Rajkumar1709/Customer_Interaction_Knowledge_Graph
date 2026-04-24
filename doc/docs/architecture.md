# System Architecture

The Customer Interaction Knowledge Graph project follows a standard modern web stack decoupled from a graph database intelligence layer.

## Component Architecture

Below is the high-level component diagram illustrating how our custom application sits above the RealPage data ecosystem.

```mermaid
graph TD
    subgraph "RealPage Data Sources"
        SFDC[Salesforce]
        OMS[Oracle OMS]
        SMC[Smartsheet]
        CLARI[Clari Copilot]
    end

    subgraph "Backend System (Python)"
        Ingest[Ingestion Service]
        API[FastAPI Routes]
        Insights[AI Insight Service]
        Score[Risk Scoring Service]
        API --> Insights
        API --> Score
        Insights --> LLM[OpenAI/LLM]
    end

    subgraph "Database Layer"
        Neo4j[(Neo4j Graph Database)]
    end

    subgraph "Frontend Layer (React)"
        UI[Knowledge Graph UI Dashboard]
        Search[Account Search]
        Vis[Interactive Graph View]
        Detail[Risk & Insight Panel]
        
        UI --> Search
        UI --> Vis
        UI --> Detail
    end

    SFDC --> Ingest
    OMS --> Ingest
    SMC --> Ingest
    CLARI --> Ingest
    
    Ingest --> Neo4j
    Score --> Neo4j
    Insights --> Neo4j
    
    Detail --> API
    Search --> API
    Vis --> API
```

## Folder Structure

```text
/HACKATHON
├── frontend/ (React UI)
│   └── src/
│       ├── components/    # GraphView, NodeDetails, InsightPanel
│       ├── pages/         # Search page, Account details
│       ├── services/      # API communication
│       └── types/         # Typescript interfaces
└── backend/  (Python App)
    └── app/
        ├── routes/        # /accounts, /ingest, /insights 
        ├── services/      # neo4j_service, risk_service
        ├── models/        # Pydantic schemas
        └── data/          # Synthetic CSVs
```
