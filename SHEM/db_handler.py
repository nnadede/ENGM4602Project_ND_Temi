# SHEM/db_handler.py
import datetime
from pymongo import MongoClient

class DBHandler:
    def __init__(
        self,
        uri="mongodb+srv://Temicruise007:Goldberg136166@cluster0.txypd.mongodb.net/smart_home_energy_monitor?retryWrites=true&w=majority&appName=Cluster0",
        db_name="smart_home_energy_monitor",
        collection_name="readings"
    ):
        """
        Connect to MongoDB Atlas using the given URI.
        """
        try:
            self.client = MongoClient(uri)
            self.db = self.client[db_name]
            self.collection = self.db[collection_name]
            print("Connected to MongoDB Atlas successfully!")
        except Exception as e:
            print(f"Error connecting to MongoDB Atlas: {e}")

    def log_reading(self, category, usage, cost, simulation_date):
        """
        Insert a reading document into the collection.
        simulation_date should be a string in YYYY-MM-DD format.
        """
        doc = {
            "category": category,
            "usage": usage,
            "cost": cost,
            "simulation_date": simulation_date
        }
        try:
            self.collection.insert_one(doc)
        except Exception as e:
            print(f"Error inserting document: {e}")

    def get_latest_date(self):
        """
        Returns the most recent simulation_date in the DB as a string (YYYY-MM-DD).
        If no data, return None.
        """
        try:
            latest = self.collection.find_one(
                sort=[("simulation_date", -1)]  # Sort descending
            )
            return latest["simulation_date"] if latest else None
        except Exception as e:
            print(f"Error fetching latest date: {e}")
            return None

    def fetch_readings_for_date(self, simulation_date):
        """
        Returns all readings for a specific simulation_date.
        """
        try:
            cursor = self.collection.find({"simulation_date": simulation_date}, {"_id": 0})
            return list(cursor)
        except Exception as e:
            print(f"Error fetching documents for date {simulation_date}: {e}")
            return []

    def fetch_history(self):
        """
        Returns aggregated usage/cost by simulation_date for historical charting.
        """
        try:
            pipeline = [
                {
                    "$group": {
                        "_id": "$simulation_date",
                        "total_usage": {"$sum": "$usage"},
                        "total_cost": {"$sum": "$cost"}
                    }
                },
                {
                    "$sort": {
                        "_id": 1
                    }
                }
            ]
            results = list(self.collection.aggregate(pipeline))
            # Convert to a friendlier format
            # e.g., [{ "simulation_date": "2025-03-02", "total_usage": 1234.5, "total_cost": 123.4 }, ...]
            history = []
            for r in results:
                history.append({
                    "simulation_date": r["_id"],
                    "total_usage": r["total_usage"],
                    "total_cost": r["total_cost"]
                })
            return history
        except Exception as e:
            print(f"Error fetching history: {e}")
            return []

    def clear_readings(self):
        """
        Clears all readings from the collection.
        """
        try:
            self.collection.delete_many({})
            return True
        except Exception as e:
            print(f"Error clearing readings: {e}")
            return False