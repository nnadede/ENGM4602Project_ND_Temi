# SHEM/controllers.py
import datetime
from .db_handler import DBHandler

class EnergyController:
    def __init__(self, sensors, cost_rate=0.12):
        """
        :param sensors: A list of CategorySensor objects
        :param cost_rate: The realistic cost per kWh (USD/kWh)
        """
        self.sensors = sensors
        self.db = DBHandler()
        self.cost_rate = cost_rate

    def simulate_month(self):
        """
        Simulates usage for the next month based on the most recent date in the DB.
        If DB is empty, use today's date for the first simulation.
        Otherwise, add one month to the latest date.
        """
        # 1) Determine next simulation_date
        latest_date = self.db.get_latest_date()
        if latest_date is None:
            # No data in DB, use current date in YYYY-MM-DD
            next_date = datetime.datetime.now().strftime("%Y-%m-%d")
        else:
            # Convert string to date, then add one month
            year, month, day = map(int, latest_date.split("-"))
            current_dt = datetime.date(year, month, day)
            # Add one month
            new_month = month + 1
            new_year = year
            if new_month > 12:
                new_month = 1
                new_year += 1
            # Keep the same day if possible, but watch out for edge cases (e.g., 31 -> next month)
            # For simplicity, just clamp day if it's out of range for that month
            # This is simplistic; you could do more robust date logic if needed
            try:
                next_dt = datetime.date(new_year, new_month, day)
            except ValueError:
                # if day is out of range, fallback to the last day of that month
                # but let's just do day=1 for simplicity
                next_dt = datetime.date(new_year, new_month, 1)

            next_date = next_dt.strftime("%Y-%m-%d")

        # 2) For each sensor, read usage & compute cost
        final_readings = []
        for sensor in self.sensors:
            try:
                usage_kwh = sensor.read_data()
                cost = usage_kwh * self.cost_rate
                # Log to DB
                self.db.log_reading(
                    category=sensor.category_name,
                    usage=usage_kwh,
                    cost=cost,
                    simulation_date=next_date
                )
                final_readings.append({
                    "category": sensor.category_name,
                    "usage": usage_kwh,
                    "cost": cost
                })
            except ValueError as e:
                # Sensor malfunction
                print(e)

        return {
            "simulation_date": next_date,
            "readings": final_readings
        }
