from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import accounts

app = FastAPI(title="RealPage Customer Interaction Knowledge Graph API", version="1.0.0")

# Configure CORS for React Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router, prefix="/accounts", tags=["accounts"])

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "Knowledge Graph API is running"}
