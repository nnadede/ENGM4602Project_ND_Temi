# SHEM/prediction.py
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression

class PredictionModel:
    def __init__(self, historical_data=None):
        """
        historical_data: a DataFrame with columns ['timestamp', 'usage'] at minimum.
        """
        self.model = LinearRegression()
        if historical_data is not None and not historical_data.empty:
            self.train_model(historical_data)

    def train_model(self, historical_data):
        """
        Train the model using the hour of day as a single feature.
        """
        try:
            historical_data['hour'] = pd.to_datetime(historical_data['timestamp']).dt.hour
            X = historical_data[['hour']].values
            y = historical_data['usage'].values
            self.model.fit(X, y)
        except Exception as e:
            print(f"Error training model: {e}")

    def predict(self, timestamp):
        """
        Predict total usage for a given timestamp.
        """
        try:
            hour = np.array([pd.to_datetime(timestamp).hour]).reshape(-1, 1)
            prediction = self.model.predict(hour)
            return float(prediction[0])
        except Exception as e:
            print(f"Error predicting usage: {e}")
            return None

    def provide_suggestions(self, current_usage):
        """
        Provide more advanced energy-saving suggestions based on usage level.
        """
        suggestions = []
        if current_usage > 600:
            suggestions.append("Your usage is very high. Consider insulation improvements and a smart thermostat.")
            suggestions.append("Use off-peak hours for laundry or dishwashing to reduce costs.")
            suggestions.append("Check for air leaks around doors/windows to reduce heating/cooling loss.")
        elif current_usage > 400:
            suggestions.append("Moderate usage. Switch to LED bulbs and unplug idle electronics.")
            suggestions.append("Monitor large appliances and consider scheduling usage for off-peak hours.")
            suggestions.append("Close curtains at night to retain heat in winter (or block heat in summer).")
        else:
            suggestions.append("Your usage is relatively low. Keep up the good work!")
            suggestions.append("Maintain energy-efficient habits like using cold water for laundry.")
            suggestions.append("Regularly clean or replace HVAC filters for maximum efficiency.")

        return suggestions
