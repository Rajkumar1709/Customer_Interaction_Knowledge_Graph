from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class AccountSummary(BaseModel):
    id: str
    name: str
    health_score: int
    arr_acv: float
    segment: str

class NodeData(BaseModel):
    id: str
    label: str
    properties: Dict[str, Any]

class EdgeData(BaseModel):
    source: str
    target: str
    type: str

class GraphResponse(BaseModel):
    nodes: List[NodeData]
    edges: List[EdgeData]

class InsightResponse(BaseModel):
    risk_score: int
    risk_band: str
    top_drivers: List[str]
    summary_text: str
    recommended_actions: List[str]
