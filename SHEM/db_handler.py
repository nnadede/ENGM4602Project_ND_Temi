# SHEM/db_handler.py
import datetime
from pymongo import MongoClient

class DBHandler:
    def __init__(
        self,
        uri="mongodb+srv://Temicruise007:Goldberg136166@cluster0.txypd.mongodb.net/smart_home_energy_monitor_atlas?retryWrites=true&w=majority&appName=Cluster0",
        db_name="smart_home_energy_monitor_atlas",
        collection_name="readings"
    ):
        """
        Connect to MongoDB Atlas using the given URI.
        :param uri: Your Atlas connection string
        :param db_name: The database name (distinct from 'mern-project')
        :param collection_name: The default collection for storing readings
        """
        try:
            self.client = MongoClient(uri)
            self.db = self.client[db_name]
            self.collection = self.db[collection_name]
            print("Connected to MongoDB Atlas successfully!")
        except Exception as e:
            print(f"Error connecting to MongoDB Atlas: {e}")

    def log_reading(self, category, usage, cost, timestamp=None):
        """
        Insert a reading document into the collection.
        """
        if not timestamp:
            timestamp = datetime.datetime.now().isoformat()

        doc = {
            "category": category,
            "usage": usage,
            "cost": cost,
            "timestamp": timestamp
        }

        try:
            self.collection.insert_one(doc)
        except Exception as e:
            print(f"Error inserting document: {e}")

    def fetch_all_readings(self):
        """
        Returns a list of all readings (dicts) from the collection.
        """
        try:
            return list(self.collection.find({}, {"_id": 0}))
        except Exception as e:
            print(f"Error fetching documents: {e}")
            return []

    def fetch_readings_as_df(self):
        """
        Returns a Pandas DataFrame of all readings, convenient for ML tasks.
        """
        import pandas as pd
        docs = self.fetch_all_readings()
        if not docs:
            return pd.DataFrame()
        return pd.DataFrame(docs)
