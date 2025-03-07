# SHEM/controllers.py
import datetime
import random
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
        Also factors in seasonality and dynamic usage ranges.
        """
        # 1) Determine next simulation_date
        latest_date = self.db.get_latest_date()
        if latest_date is None:
            next_date = datetime.datetime.now().strftime("%Y-%m-%d")
        else:
            year, month, day = map(int, latest_date.split("-"))
            new_month = month + 1
            new_year = year
            if new_month > 12:
                new_month = 1
                new_year += 1
            try:
                next_dt = datetime.date(new_year, new_month, day)
            except ValueError:
                next_dt = datetime.date(new_year, new_month, 1)
            next_date = next_dt.strftime("%Y-%m-%d")

        # 2) Determine season based on month
        month_int = int(next_date.split("-")[1])
        if month_int in [12, 1, 2]:
            season = "Winter"
        elif month_int in [3, 4, 5]:
            season = "Spring"
        elif month_int in [6, 7, 8]:
            season = "Summer"
        else:
            season = "Fall"

        # 3) Determine overall usage range scenario (weighted random choice)
        usage_range = random.choices(
            population=["low", "moderate", "above average", "high", "very high", "alarming"],
            weights=[10, 20, 25, 25, 15, 5],
            k=1
        )[0]

        final_readings = []
        for sensor in self.sensors:
            try:
                # Pass season and usage_range to sensor simulation
                usage_kwh = sensor.read_data(season=season, usage_range=usage_range)
                cost = usage_kwh * self.cost_rate
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
                print(e)

        return {
            "simulation_date": next_date,
            "readings": final_readings
        }
