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

# Define your category sensors (including HVAC)
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

# Initialize controller with sensors and a realistic cost rate
controller = EnergyController(sensors=category_sensors, cost_rate=0.12)

# Prepare a DB handler for queries
db = DBHandler()

def build_prediction_model():
    """
    Helper function to build or update the prediction model from historical data.
    """
    history = db.fetch_history()
    if not history:
        return None

    df = pd.DataFrame(history)
    if df.empty or len(df) < 2:
        return None

    model = PredictionModel(historical_data=df)
    if model.is_trained:
        return model
    return None

# Build the model at startup (if enough data)
prediction_model = build_prediction_model()

@app.route("/")
def home():
    return "<h1>Smart Home Energy Monitor</h1><p>Welcome to the home page.</p>"

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
    Predict usage for a given month.
    """
    if not prediction_model or not prediction_model.is_trained:
        return jsonify({"error": "Insufficient data to generate a prediction."}), 400

    target_month = request.args.get("month")
    if not target_month:
        return jsonify({"error": "Please provide 'month' in YYYY-MM-DD format."}), 400

    history = db.fetch_history()
    df = pd.DataFrame(history).sort_values("simulation_date")
    df["month_index"] = range(len(df))

    earliest_str = df["simulation_date"].iloc[0]
    y0, m0, d0 = map(int, earliest_str.split("-"))
    earliest_dt = datetime.date(y0, m0, d0)

    ty, tm, td = map(int, target_month.split("-"))
    target_dt = datetime.date(ty, tm, td)
    month_diff = (target_dt.year - earliest_dt.year) * 12 + (target_dt.month - earliest_dt.month)
    if month_diff < 0:
        return jsonify({"error": "Target month is before earliest recorded month."}), 400

    predicted_value = prediction_model.predict(month_diff)
    if predicted_value is None:
        return jsonify({"error": "Prediction failed."}), 500

    return jsonify({
        "target_month": target_month,
        "predicted_usage_kwh": predicted_value
    })

@app.route("/breakdown", methods=["GET"])
def breakdown():
    """
    Merged breakdown and suggestions endpoint.
    Returns a detailed breakdown of the most recent simulated month along with an efficiency rating
    and dynamic suggestions (both general and category-specific).
    """
    month_param = request.args.get("month")
    if not month_param:
        month_param = db.get_latest_date()
        if not month_param:
            return jsonify({"message": "No breakdown available. Please simulate data first.", "data": None}), 200

    # Determine if month_param is in "YYYY-MM" or full date format
    if len(month_param) == 7:
        readings = db.fetch_readings_for_month(month_param)
    else:
        readings = db.fetch_readings_for_date(month_param)

    if not readings:
        return jsonify({"message": f"No breakdown available for {month_param}. Try entering a valid year and month or start simulation.", "data": None}), 200

    total_usage = sum(r["usage"] for r in readings)
    total_cost = sum(r["cost"] for r in readings)
    breakdown_by_category = {}
    for r in readings:
        cat = r["category"]
        breakdown_by_category.setdefault(cat, {"usage": 0, "cost": 0})
        breakdown_by_category[cat]["usage"] += r["usage"]
        breakdown_by_category[cat]["cost"] += r["cost"]

    # Calculate usage percentage for each category only (remove cost percentage)
    for cat, data in breakdown_by_category.items():
        data["usage_percentage"] = (data["usage"] / total_usage * 100) if total_usage > 0 else 0

    # Determine season from the month
    try:
        _, month, _ = map(int, month_param.split("-"))
    except Exception:
        month = 1
    if month in [12, 1, 2]:
        season = "Winter"
    elif month in [3, 4, 5]:
        season = "Spring"
    elif month in [6, 7, 8]:
        season = "Summer"
    else:
        season = "Fall"

    # Calculate efficiency rating based on total usage thresholds
    if total_usage < 1000:
        rating = "A"
    elif total_usage < 1500:
        rating = "B"
    elif total_usage < 2000:
        rating = "C"
    elif total_usage < 2500:
        rating = "D"
    else:
        rating = "F"

    suggestions_list = []
    # Add some general suggestions
    suggestions_list.append("Review your monthly energy consumption and compare with previous months to track trends.")
    suggestions_list.append("Consider scheduling regular appliance maintenance to improve efficiency.")

    # Rating-based general suggestions
    if rating == "F":
        suggestions_list.append("Your overall energy consumption is alarming. Consider an energy audit immediately.")
        suggestions_list.append("Explore renewable energy options to reduce dependency on traditional power sources.")
    elif rating == "D":
        suggestions_list.append("Your energy consumption is high. Upgrading to energy-efficient appliances might help.")
    elif rating == "C":
        suggestions_list.append("Moderate consumption detected. Look into minor behavioral changes to lower usage.")
    elif rating == "B":
        suggestions_list.append("Good energy usage overall, but there is room for improvement.")
    else:
        suggestions_list.append("Excellent energy efficiency! Continue your sustainable practices.")

    # Category-specific suggestions (adding dynamic suggestions based on usage percentages)
    for cat, data in breakdown_by_category.items():
        perc = data["usage_percentage"]
        if cat in ["Heating", "HVAC"]:
            if season == "Winter" and perc > 30:
                suggestions_list.append(f"High {cat} usage detected in winter. Consider lowering your thermostat or improving insulation.")
            elif perc > 25:
                suggestions_list.append(f"Consider optimizing your {cat} settings to reduce energy consumption.")
        elif cat == "Lighting":
            if season == "Winter" and perc > 25:
                suggestions_list.append("Switching to LED bulbs and maximizing natural light can reduce lighting costs.")
            elif perc > 20:
                suggestions_list.append("Consider using smart lighting systems to control energy use.")
        elif cat == "Water Heating":
            if perc > 20:
                suggestions_list.append("Lowering your water heater temperature or insulating your tank can improve efficiency.")
        elif cat == "Cooking":
            if perc > 15:
                suggestions_list.append("Use energy-efficient cooking methods and appliances to save power.")
        elif cat == "Entertainment":
            if perc > 15:
                suggestions_list.append("Unplug idle devices or use power strips to prevent phantom loads in entertainment systems.")
        elif cat == "Refrigeration":
            if perc > 15:
                suggestions_list.append("Ensure your refrigerator is well-maintained and energy-efficient.")
        elif cat == "Always On":
            if perc > 10:
                suggestions_list.append("Review devices that are always on and unplug those not in active use.")
        elif cat == "Other":
            if perc > 10:
                suggestions_list.append("Check miscellaneous devices for hidden energy drains and optimize usage.")

    dashboard_data = {
        "simulation_date": month_param,
        "total_usage": total_usage,
        "total_cost": total_cost,
        "breakdown_by_category": breakdown_by_category,
        "efficiency_rating": rating,
        "suggestions": suggestions_list
    }

    return jsonify({"message": "Breakdown data fetched successfully.", "data": dashboard_data})

if __name__ == "__main__":
    # IMPORTANT: Run from the parent directory using: python -m SHEM.flask_app
    app.run(debug=True)
