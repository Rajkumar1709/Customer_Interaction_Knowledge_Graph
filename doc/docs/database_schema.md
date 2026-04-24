# Database Schema

The intelligence layer is powered by **Neo4j** to uncover relationships that traditional relational databases obscure.

## Graph Entity-Relationship Diagram

```mermaid
erDiagram
    ACCOUNT {
        string id PK
        string name
        string segment
        float arr_acv
        string owner
        int health_score
    }
    TICKET {
        string id PK
        string severity
        string status
        date created_at
    }
    BILLING_ISSUE {
        string id PK
        float amount
        string status
        int overdue_days
    }
    INTERACTION {
        string id PK
        string sentiment
        string summary
        date date
    }
    RENEWAL {
        string id PK
        date renewal_date
        string status
    }
    IMPLEMENTATION_ORDER {
        string id PK
        string notes
        string configuration
    }

    ACCOUNT ||--o{ TICKET : "HAS_TICKET"
    ACCOUNT ||--o{ BILLING_ISSUE : "HAS_BILLING_ISSUE"
    ACCOUNT ||--o{ INTERACTION : "HAS_INTERACTION"
    ACCOUNT ||--o{ RENEWAL : "HAS_RENEWAL"
    ACCOUNT ||--o{ IMPLEMENTATION_ORDER : "HAS_IMPLEMENTATION_EVENT"
    
    TICKET }|--|| INTERACTION : "MENTIONS"
    IMPLEMENTATION_ORDER ||--o{ TICKET : "BLOCKS"
```

## Node Labels
- **Account**, **Property**, **Product**
- **Ticket** (Support/PME)
- **BillingIssue** (Collections/Aging)
- **Interaction** (Clari/Salesforce calls)
- **Renewal** (Opportunities)
- **ImplementationOrder** (OMS Open Orders)
- **Escalation** 

## Tracking Customizations
Crucially, the `ImplementationOrder` nodes store *notes*, tracking customizations and key configuration decisions outside of best practice, assisting support to better troubleshoot specific PMC setups.
