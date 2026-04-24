import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "neo4j+s://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

class Neo4jConnection:
    def __init__(self, uri, user, pwd):
        try:
            self.driver = GraphDatabase.driver(uri, auth=(user, pwd))
        except Exception as e:
            print("Failed to create the driver:", e)
            self.driver = None

    def close(self):
        if self.driver is not None:
            self.driver.close()

    def query(self, query, parameters=None):
        assert self.driver is not None, "Driver not initialized!"
        session = None
        response = None
        try: 
            session = self.driver.session()
            response = list(session.run(query, parameters))
        except Exception as e:
            print("Query failed:", e)
        finally: 
            if session is not None:
                session.close()
        return response

db = Neo4jConnection(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD)
