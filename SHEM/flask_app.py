# SHEM/flask_app.py
import random
import datetime
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS  # <-- Add/keep this import
from .sensors import CategorySensor
from .controllers import EnergyController
from .prediction import PredictionModel
from .db_handler import DBHandler

app = Flask(__name__)
CORS(app)  # <-- Enable CORS for all routes

# 1) Define your category sensors with base usage approximations
category_sensors = [
    CategorySensor("Heating", 300),
    CategorySensor("Water Heating", 250),
    CategorySensor("Lighting", 200),
    CategorySensor("Cooking", 150),
    CategorySensor("Entertainment", 150),
    CategorySensor("Refrigeration", 100),
    CategorySensor("Always On", 50),
    CategorySensor("Other", 100)
]

# 2) Randomize the monthly usage/cost for each run
household_usage = random.randint(3000, 5000)  # e.g., 3000-5000 kWh
household_cost = random.randint(300, 1600)    # e.g., $700-$1000
print(f"Simulating household usage = {household_usage} kWh, cost = ${household_cost} for this run.")

# 3) Initialize controller with the random usage/cost
controller = EnergyController(
    sensors=category_sensors,
    total_kwh=household_usage,
    total_cost=household_cost
)

# 4) Prepare a DB handler for queries (already set to Atlas)
db = DBHandler()

# 5) Build or update the prediction model from historical data
historical_df = db.fetch_readings_as_df()
if not historical_df.empty:
    grouped = historical_df.groupby("timestamp", as_index=False).agg({"usage": "sum"})
    prediction_model = PredictionModel(historical_data=grouped)
else:
    prediction_model = PredictionModel()

@app.route("/")
def home():
    return "<h1>Smart Home Energy Monitor</h1><p>Welcome to the home page.</p>"

@app.route("/readings", methods=["GET"])
def get_readings():
    """
    Simulate a new set of category readings (which also logs them in DB).
    Returns the newly gathered usage/cost data.
    """
    data = controller.gather_data()
    return jsonify({"data": data})

@app.route("/predict", methods=["GET"])
def predict_usage():
    """
    Predict total usage for a given timestamp (or now if not provided).
    """
    timestamp_str = request.args.get("timestamp")
    if not timestamp_str:
        timestamp_str = datetime.datetime.now().isoformat()

    predicted_value = prediction_model.predict(timestamp_str)
    return jsonify({
        "timestamp": timestamp_str,
        "predicted_usage": predicted_value
    })

@app.route("/suggestions", methods=["GET"])
def get_suggestions():
    """
    Provide suggestions based on a 'usage' query parameter.
    """
    current_usage = request.args.get("usage", type=float)
    if current_usage is None:
        return jsonify({"error": "Please provide current usage via 'usage' parameter"}), 400

    suggestions = prediction_model.provide_suggestions(current_usage)
    return jsonify({"current_usage": current_usage, "suggestions": suggestions})

@app.route("/breakdown", methods=["GET"])
def get_breakdown():
    """
    Returns an aggregated breakdown of usage and cost by category from DB.
    """
    all_readings = db.fetch_all_readings()
    if not all_readings:
        return jsonify({"message": "No readings available."}), 200

    df = pd.DataFrame(all_readings)
    grouped = df.groupby("category", as_index=False).agg({"usage": "sum", "cost": "sum"})
    breakdown_list = grouped.to_dict(orient="records")
    total_usage = grouped["usage"].sum()
    total_cost = grouped["cost"].sum()

    return jsonify({
        "breakdown": breakdown_list,
        "total_usage_kwh": total_usage,
        "total_cost_usd": total_cost
    })

if __name__ == "__main__":
    # IMPORTANT: Run from the parent directory using: python -m SHEM.flask_app
    app.run(debug=True)
