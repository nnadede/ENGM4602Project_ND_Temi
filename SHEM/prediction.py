# SHEM/prediction.py
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression

class PredictionModel:
    def __init__(self, historical_data=None):
        """
        historical_data: a DataFrame with columns ['simulation_date', 'total_usage'] at minimum.
        We'll do a very simple month-based regression:
          X = month index (0, 1, 2, ...)
          y = total_usage
        """
        self.model = LinearRegression()
        self.is_trained = False

        if historical_data is not None and not historical_data.empty:
            self.train_model(historical_data)

    def train_model(self, historical_data):
        """
        Convert each simulation_date into an integer index in chronological order.
        e.g., earliest date => index=0, next => index=1, etc.
        """
        try:
            # Sort by date
            historical_data = historical_data.sort_values("simulation_date")
            # Create an index for each row
            historical_data["month_index"] = range(len(historical_data))

            X = historical_data[["month_index"]].values
            y = historical_data["total_usage"].values
            if len(X) < 2:
                # Not enough data to train a meaningful model
                return

            self.model.fit(X, y)
            self.is_trained = True
        except Exception as e:
            print(f"Error training model: {e}")

    def predict(self, month_index):
        """
        Predict total usage given a month_index (integer).
        If not trained or insufficient data, return None.
        """
        if not self.is_trained:
            return None
        try:
            prediction = self.model.predict([[month_index]])
            return float(prediction[0])
        except Exception as e:
            print(f"Error predicting usage: {e}")
            return None

    def provide_suggestions(self, current_usage):
        """
        Provide energy-saving suggestions based on usage level.
        """
        suggestions = []
        if current_usage > 800:
            suggestions.append("Your usage is very high. Consider upgrading insulation and using a smart thermostat.")
            suggestions.append("Try shifting high-power tasks to off-peak hours to reduce costs.")
        elif current_usage > 500:
            suggestions.append("Moderate usage. Switch to LED bulbs and unplug idle electronics.")
            suggestions.append("Monitor large appliances and consider scheduling usage for off-peak hours.")
        else:
            suggestions.append("Your usage is relatively low. Keep up the good work!")
            suggestions.append("Maintain energy-efficient habits like using cold water for laundry.")
        return suggestions
