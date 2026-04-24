from fastapi import APIRouter, HTTPException
from typing import List
from app.models.schemas import AccountSummary, GraphResponse, InsightResponse
from app.database import db

router = APIRouter()

@router.get("/search", response_model=List[AccountSummary])
def search_accounts(q: str = ""):
    query = """
    MATCH (a:Account)
    WHERE toLower(a.name) CONTAINS toLower($q)
    RETURN a.id AS id, a.name AS name, a.health_score AS health_score, 
           a.arr_acv AS arr_acv, a.segment AS segment
    LIMIT 20
    """
    try:
        results = db.query(query, parameters={"q": q})
        if not results:
            return []
        return [AccountSummary(**record) for record in results]
    except Exception as e:
        # Fallback if DB is not connected yet for demo UI testing
        if q.lower() in "oakridge":
            return [AccountSummary(id="A-100", name="Oakridge Residential", health_score=40, arr_acv=150000.0, segment="Enterprise")]
        return []

@router.get("/{account_id}/graph", response_model=GraphResponse)
def get_account_graph(account_id: str):
    # This query finds the account and expands to all connected nodes up to 2 hops away.
    # We cap at a reasonable limit to prevent browser crashing in large PMCs.
    query = """
    MATCH path = (a:Account {id: $account_id})-[*1..2]-()
    WITH path
    LIMIT 100
    UNWIND nodes(path) AS n
    UNWIND relationships(path) AS r
    RETURN collect(distinct n) as nodes, collect(distinct r) as edges
    """
    try:
        results = db.query(query, parameters={"account_id": account_id})
        nodes_list = []
        edges_list = []
        if results and len(results) > 0 and results[0]["nodes"]:
            for n in results[0]["nodes"]:
                labels = list(n.labels)
                label = labels[0] if labels else "Unknown"
                # Ensure the id is extracted properly. D3/react-force-graph prefers 'id'.
                n_props = dict(n)
                n_id = n_props.get("id", str(n.element_id))
                nodes_list.append({
                    "id": n_id,
                    "label": label,
                    "properties": n_props
                })
            
            for r in results[0]["edges"]:
                edges_list.append({
                    "source": r.start_node.get("id", str(r.start_node.element_id)),
                    "target": r.end_node.get("id", str(r.end_node.element_id)),
                    "type": r.type
                })
                
        return GraphResponse(nodes=nodes_list, edges=edges_list)
    except Exception as e:
        # Mock payload for testing UI before DB is populated
        return GraphResponse(
            nodes=[
                {"id": "A-100", "label": "Account", "properties": {"name": "Oakridge Residential"}},
                {"id": "T-505", "label": "Ticket", "properties": {"status": "Open", "severity": "P1"}},
                {"id": "B-99", "label": "BillingIssue", "properties": {"amount": 5400, "overdue_days": 45}}
            ],
            edges=[
                {"source": "A-100", "target": "T-505", "type": "HAS_TICKET"},
                {"source": "A-100", "target": "B-99", "type": "HAS_BILLING_ISSUE"}
            ]
        )

@router.get("/{account_id}/insights", response_model=InsightResponse)
def get_account_insights(account_id: str):
    # In a real scenario, we'd query the graph to count open P1s, billing issues etc.
    # and feed it to an LLM. Since the user requested a mock AI to avoid costs:
    
    if account_id == "A-100":
        # Simulating the high-risk "Oakridge" account
        return InsightResponse(
            risk_score=85,
            risk_band="Critical",
            top_drivers=["3 Unresolved P1/P2 Support Tickets", "Overdue Billing Invoice ($5,400)", "Upcoming Renewal within 30 days"],
            summary_text="This account appears high-risk primarily due to a combination of deeply rooted P2 support issues spanning multiple properties, compounded by an unresolved billing dispute. The looming renewal deadline in 28 days transforms this from a standard operational issue into an immediate churn risk.",
            recommended_actions=[
                "Immediately escalate Ticket T-505 to Tier 3 Implementation Support.",
                "Waive late fees on B-99 as a gesture of goodwill prior to renewal negotiations.",
                "Schedule a proactive Executive Business Review (EBR) this week."
            ]
        )
    return InsightResponse(
        risk_score=20,
        risk_band="Low",
        top_drivers=["No critical escalations"],
        summary_text="Account is exhibiting stable health indicators. Adoption is steady and no high-severity tickets are currently open.",
        recommended_actions=["Check in next month for standard QBR."]
    )
