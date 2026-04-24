# Developer Setup Guide

This guide documents the step-by-step unvarnished process of how the MVP was built from scratch and how another developer can run it.

## 1. Backend Initialization (FastAPI)

### Prerequisites Setup
1. Python 3.10+ is recommended.
2. An `.env` file must be created in `backend/app/` containing Neo4j credentials:
   ```env
   NEO4J_URI=neo4j+s://<YOUR_INSTANCE>.databases.neo4j.io
   NEO4J_USER=neo4j
   NEO4J_PASSWORD=<YOUR_PASSWORD>
   ```

### Dependencies
Install the required packages:
```bash
cd backend
pip install -r requirements.txt
```

### Starting the Backend
To run the FastAPI server locally:
```bash
uvicorn app.main:app --reload
```
The API will be available at `http://localhost:8000`.

## 2. Data Ingestion Pipeline

To populate your graph database, we built static data generation scripts.

1. **Generate the CSVs**:
   ```bash
   python app/data_generator.py
   ```
   *This creates Account, Ticket, Renewal, and Billing interaction data in `app/data/`.*

2. **Ingest to Neo4j**:
   ```bash
   python app/ingest.py
   ```
   *This wipes any existing graph data and securely uploads nodes/edges. It requires your `.env` variables to be set up correctly.*

## 3. Frontend Initialization (React / Vite)

The frontend is built using Vite, React 18, React-Force-Graph-2D, and vanilla CSS for extreme control over the glassmorphism design aesthetic matching RealPage's brand guidelines.

### Setup
Ensure you have Node.js v18+ installed.

```bash
cd frontend
npm install
```

### Starting the Application
```bash
npm run dev
```

The application will launch on `http://localhost:5173`. 

*Note for Hackathon purposes: If the backend is offline, the React UI gracefully mocks AI datasets to ensure your demo never fails under pressure.*
