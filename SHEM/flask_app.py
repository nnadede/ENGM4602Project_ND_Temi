# SHEM/flask_app.py
import datetime
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

from .sensors import CategorySensor
from .controllers import EnergyController
from .prediction import PredictionModel
from .db_handler import DBHandler

app = Flask(__name__)
CORS(app)  # enable CORS for all routes

# 1) Define your category sensors (including HVAC)
category_sensors = [
    CategorySensor("Heating", 300),
    CategorySensor("Water Heating", 250),
    CategorySensor("Lighting", 200),
    CategorySensor("Cooking", 150),
    CategorySensor("Entertainment", 150),
    CategorySensor("Refrigeration", 100),
    CategorySensor("Always On", 50),
    CategorySensor("Other", 100),
    CategorySensor("HVAC", 350)  # newly added
]

# 2) Initialize controller with sensors and a realistic cost rate
controller = EnergyController(sensors=category_sensors, cost_rate=0.12)

# 3) Prepare a DB handler for queries
db = DBHandler()

def build_prediction_model():
    """
    Helper function to build or update the prediction model from historical data.
    We'll group by simulation_date to get total_usage per month.
    """
    history = db.fetch_history()  # returns a list of dicts with simulation_date, total_usage, total_cost
    if not history:
        return None

    df = pd.DataFrame(history)
    if df.empty or len(df) < 2:
        # Not enough data
        return None

    # rename columns to match what we expect in PredictionModel
    df.rename(columns={"total_usage": "total_usage"}, inplace=True)

    # Pass it to the model
    model = PredictionModel(historical_data=df)
    if model.is_trained:
        return model
    return None

# Build the model at startup (if enough data)
prediction_model = build_prediction_model()

@app.route("/")
def home():
    return "<h1>Smart Home Energy Monitor</h1><p>Welcome to the home page.</p>"

@app.route("/simulate", methods=["POST"])
def simulate():
    """
    Simulate the next month's usage, log it, and return the results.
    """
    result = controller.simulate_month()
    # Rebuild the prediction model with updated data
    global prediction_model
    prediction_model = build_prediction_model()
    return jsonify(result)

@app.route("/readings", methods=["GET"])
def get_readings():
    month_param = request.args.get("month")
    if not month_param:
        # if no month provided, use the latest date from the database
        month_param = db.get_latest_date()
        if not month_param:
            return jsonify({"message": "No entries available.", "readings": []}), 200

    # If the parameter is in "YYYY-MM" format (7 characters), use the month filter
    if len(month_param) == 7:
        readings = db.fetch_readings_for_month(month_param)
    else:
        readings = db.fetch_readings_for_date(month_param)

    if not readings:
        return jsonify({"message": f"No readings for {month_param}.", "readings": []}), 200

    return jsonify({"simulation_date": month_param, "readings": readings})

@app.route("/clear_readings", methods=["DELETE"])
def clear_readings():
    success = db.clear_readings()
    if success:
        return jsonify({"message": "All readings cleared."})
    else:
        return jsonify({"error": "Failed to clear readings."}), 500

@app.route("/history", methods=["GET"])
def get_history():
    """
    Returns aggregated usage/cost by month for charting.
    """
    history = db.fetch_history()
    if not history:
        return jsonify({"history": [], "message": "No historical data found."}), 200
    return jsonify({"history": history})

@app.route("/predict", methods=["GET"])
def predict_usage():
    """
    Predict usage for the 'next' month index or a future month index.
    For simplicity, we let the user pass a 'target_month' in YYYY-MM-DD format,
    figure out its month index, and predict. If no model, return an error.
    """
    if not prediction_model or not prediction_model.is_trained:
        return jsonify({"error": "Insufficient data to generate a prediction."}), 400

    target_month = request.args.get("month")
    if not target_month:
        return jsonify({"error": "Please provide 'month' in YYYY-MM-DD format."}), 400

    # We need to figure out the month_index for the given target_month
    # We'll fetch the entire history, sort by date, find the index for the last date, etc.
    history = db.fetch_history()
    df = pd.DataFrame(history).sort_values("simulation_date")
    df["month_index"] = range(len(df))

    # The highest month_index in existing data:
    max_index = df["month_index"].max()

    # If the target_month is beyond the last known month, we can just say it's next in line
    # or find exactly how many months ahead it is. For simplicity, let's do:
    #  find the earliest date, then count how many months from that to target_month.
    # This is a simplified approach.
    earliest_str = df["simulation_date"].iloc[0]
    y0, m0, d0 = map(int, earliest_str.split("-"))
    earliest_dt = datetime.date(y0, m0, d0)

    ty, tm, td = map(int, target_month.split("-"))
    target_dt = datetime.date(ty, tm, td)

    # Count months from earliest_dt to target_dt
    month_diff = (target_dt.year - earliest_dt.year) * 12 + (target_dt.month - earliest_dt.month)
    if month_diff < 0:
        return jsonify({"error": "Target month is before earliest recorded month."}), 400

    # Predict using that index
    predicted_value = prediction_model.predict(month_diff)
    if predicted_value is None:
        return jsonify({"error": "Prediction failed."}), 500

    return jsonify({
        "target_month": target_month,
        "predicted_usage_kwh": predicted_value
    })

@app.route("/suggestions", methods=["GET"])
def get_suggestions():
    """
    Provide suggestions based on a 'usage' query parameter.
    """
    current_usage = request.args.get("usage", type=float)
    if current_usage is None:
        return jsonify({"error": "Please provide current usage via 'usage' parameter"}), 400

    # If we don't have a trained model, we can still provide suggestions, or
    # we can just do it unconditionally. For now, let's do it unconditionally:
    model = prediction_model if prediction_model else PredictionModel()
    suggestions = model.provide_suggestions(current_usage)
    return jsonify({"current_usage": current_usage, "suggestions": suggestions})


if __name__ == "__main__":
    # IMPORTANT: Run from the parent directory using: python -m SHEM.flask_app
    app.run(debug=True)
