import csv
from app.database import db

def run_ingestion():
    # Note: ensure Neo4j is running and available before executing this.
    try:
        # Clear existing graph
        db.query("MATCH (n) DETACH DELETE n")
        
        # Load Accounts
        with open("app/data/accounts.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.query("CREATE (a:Account {id: $id, name: $name, segment: $segment})", parameters=row)
                
        # Load Tickets
        with open("app/data/tickets.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.query("MATCH (a:Account {id: $account_id}) CREATE (t:Ticket {id: $id, severity: $severity, status: $status})-[:HAS_TICKET]->(a)", parameters=row)
                
        # Connect Tickets to reversed relations for easier graph viz (Account -> Ticket)
        db.query("MATCH (t:Ticket)-[r:HAS_TICKET]->(a:Account) CREATE (a)-[:HAS_TICKET]->(t) DELETE r")
        
        # Load Renewals
        with open("app/data/renewals.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.query("MATCH (a:Account {id: $account_id}) CREATE (a)-[:HAS_RENEWAL]->(r:Renewal {id: $id, date: $renewal_date, status: $status})", parameters=row)
                
        # Load Billing
        with open("app/data/billing.csv", "r") as f:
            reader = csv.DictReader(f)
            for row in reader:
                db.query("MATCH (a:Account {id: $account_id}) CREATE (a)-[:HAS_BILLING_ISSUE]->(b:BillingIssue {id: $id, amount: $amount, status: $status, overdue_days: $overdue_days})", parameters=row)
        
        print("Data ingestion complete!")
    except Exception as e:
        print("Ingestion failed. Ensure Neo4j credentials are correct in .env")
        print(e)
        
if __name__ == "__main__":
    run_ingestion()
