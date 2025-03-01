# SHEM/controllers.py
import datetime
from .db_handler import DBHandler

class EnergyController:
    def __init__(self, sensors, total_kwh, total_cost):
        """
        :param sensors: A list of CategorySensor objects
        :param total_kwh: Randomized target total monthly usage (kWh)
        :param total_cost: Randomized target total monthly cost (USD)
        """
        self.sensors = sensors
        self.db = DBHandler()  # DBHandler uses the Atlas URI
        self.total_kwh = total_kwh
        self.total_cost = total_cost

    def gather_data(self):
        """
        1. Reads raw usage from each sensor.
        2. Scales all usage so that the sum matches self.total_kwh.
        3. Calculates costs so that the total matches self.total_cost.
        4. Logs each reading (category, usage, cost) to the DB.
        5. Returns a list of (category, usage, cost).
        """
        # Step 1: Read raw usage from sensors (handling malfunctions).
        raw_readings = []
        for sensor in self.sensors:
            try:
                usage_kwh = sensor.read_data()
                raw_readings.append({
                    "category": sensor.category_name,
                    "raw_usage": usage_kwh
                })
            except ValueError as e:
                # Sensor malfunction - log error or skip
                print(e)

        if not raw_readings:
            return []

        # Step 2: Scale usage to match total_kwh
        raw_total = sum(r["raw_usage"] for r in raw_readings)
        if raw_total == 0:
            return []

        usage_scale = self.total_kwh / raw_total

        # Step 3: After usage is scaled, compute cost with a base rate,
        # then scale again so total cost matches self.total_cost.
        base_rate = 0.15  # e.g., $0.15 per kWh
        scaled_readings = []
        for r in raw_readings:
            scaled_usage = r["raw_usage"] * usage_scale
            scaled_cost = scaled_usage * base_rate
            scaled_readings.append({
                "category": r["category"],
                "usage": scaled_usage,
                "cost": scaled_cost
            })

        # Now find the total cost with the base rate
        current_total_cost = sum(r["cost"] for r in scaled_readings)
        if current_total_cost == 0:
            return []

        cost_scale = self.total_cost / current_total_cost

        # Apply the final cost scaling
        final_readings = []
        timestamp = datetime.datetime.now().isoformat()
        for r in scaled_readings:
            final_usage = r["usage"]
            final_cost = r["cost"] * cost_scale
            final_readings.append({
                "category": r["category"],
                "usage": final_usage,
                "cost": final_cost
            })

            # Log each reading to DB
            self.db.log_reading(
                category=r["category"],
                usage=final_usage,
                cost=final_cost,
                timestamp=timestamp
            )

        return final_readings
