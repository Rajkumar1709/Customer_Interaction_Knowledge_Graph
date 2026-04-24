import csv
import os
import random
from datetime import datetime, timedelta

# Realistic PMC and Property prefixes/suffixes based on real RealPage data
COMPANY_PREFIXES = ["Greystar", "Winn", "Michaels", "Lindemann", "Lynd", "Abacus", "Crawford", "Nationwide", "Heritage Hill", "Pinnacle", "Sunrise", "Metro", "Oakridge", "Bet", "Westcorp", "Hamilton", "Nusbaum"]
COMPANY_SUFFIXES = ["Management Services, LLC", "Residential Corp", "Realty Company", "Investments", "Communities", "Property Management", "Capital Group", "Multifamily Management"]

PROPERTY_PREFIXES = ["Residences at", "The", "Ascend", "Shawmut", "Lakewalk at", "Rancho De", "Mizner", "Covial", "Creekside", "High and", "100 Center", "Apartments at"]
PROPERTY_SUFFIXES = ["Park", "Place", "Court", "Plaza", "Village", "Villas", "Hi Rise", "Lofts", "Community"]

def generate_csvs():
    os.makedirs("c:/HACKATHON/backend/app/data", exist_ok=True)
    
    accounts = []
    tickets = []
    renewals = []
    billing_issues = []
    properties = []
    
    # Generate 1,500 mock PMCs to simulate large scale
    num_companies = 1500
    
    # Specific injection of the 'At-Risk' specific dummy from earlier
    accounts.append({"id": "A-100", "name": "Oakridge Residential Group", "segment": "Enterprise", "arr_acv": 150000, "owner": "Lauren Neal", "health_score": 25})
    tickets.extend([
        {"id": "T-501", "account_id": "A-100", "severity": "P1", "status": "Open", "created_at": "2026-03-10"},
        {"id": "T-502", "account_id": "A-100", "severity": "P2", "status": "Open", "created_at": "2026-04-01"},
    ])
    renewals.append({"id": "R-100", "account_id": "A-100", "renewal_date": (datetime.now() + timedelta(days=28)).strftime('%Y-%m-%d'), "status": "At Risk"})
    billing_issues.append({"id": "B-100", "account_id": "A-100", "amount": 5400, "status": "Overdue", "overdue_days": 45})

    print(f"Generating {num_companies} synthetic PMCs and related interactive signals...")

    for i in range(1, num_companies):
        c_id = f"A-{100+i}"
        name = f"{random.choice(COMPANY_PREFIXES)} {random.choice(COMPANY_SUFFIXES)}"
        segment = random.choice(["Enterprise", "Mid-Market", "SMB"])
        arr = round(random.uniform(5000, 250000), 2)
        health = random.randint(15, 95) # 15-49 is risky, 50-100 is healthy
        
        accounts.append({
            "id": c_id, "name": name, "segment": segment, "arr_acv": arr,
            "owner": random.choice(["Lauren Neal", "Jennifer Stout", "Hilliard Sumner", "Titina Ott-Adams"]),
            "health_score": health
        })
        
        # Properties
        num_props = random.randint(1, 15) if segment == "Enterprise" else random.randint(1, 3)
        for p in range(num_props):
            properties.append({
                "id": f"P-{c_id}-{p}", "account_id": c_id, 
                "name": f"{random.choice(PROPERTY_PREFIXES)} {random.choice(PROPERTY_SUFFIXES)}"
            })

        # Generate anomalies if health is low
        if health < 50:
            if random.random() < 0.7:
                tickets.append({"id": f"T-{c_id}-1", "account_id": c_id, "severity": random.choice(["P1", "P2"]), "status": "Open", "created_at": "2026-04-05"})
            if random.random() < 0.5:
                billing_issues.append({"id": f"B-{c_id}-1", "account_id": c_id, "amount": random.randint(1000, 10000), "status": "Overdue", "overdue_days": random.randint(15, 90)})
            if random.random() < 0.6:
                renewals.append({"id": f"R-{c_id}-1", "account_id": c_id, "renewal_date": (datetime.now() + timedelta(days=random.randint(10, 60))).strftime('%Y-%m-%d'), "status": "At Risk"})
        else:
            if random.random() < 0.2:
                tickets.append({"id": f"T-{c_id}-1", "account_id": c_id, "severity": "P3", "status": "Resolved", "created_at": "2026-03-20"})
            renewals.append({"id": f"R-{c_id}-2", "account_id": c_id, "renewal_date": (datetime.now() + timedelta(days=random.randint(90, 365))).strftime('%Y-%m-%d'), "status": "Healthy"})

    # Write files
    with open("c:/HACKATHON/backend/app/data/accounts.csv", "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "name", "segment", "arr_acv", "owner", "health_score"])
        writer.writeheader(); writer.writerows(accounts)

    with open("c:/HACKATHON/backend/app/data/tickets.csv", "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "account_id", "severity", "status", "created_at"])
        writer.writeheader(); writer.writerows(tickets)

    with open("c:/HACKATHON/backend/app/data/renewals.csv", "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "account_id", "renewal_date", "status"])
        writer.writeheader(); writer.writerows(renewals)

    with open("c:/HACKATHON/backend/app/data/billing.csv", "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "account_id", "amount", "status", "overdue_days"])
        writer.writeheader(); writer.writerows(billing_issues)

    with open("c:/HACKATHON/backend/app/data/properties.csv", "w", newline='') as f:
        writer = csv.DictWriter(f, fieldnames=["id", "account_id", "name"])
        writer.writeheader(); writer.writerows(properties)

if __name__ == "__main__":
    generate_csvs()
    print("Large scale Synthetic PMC CSV data generated successfully.")
