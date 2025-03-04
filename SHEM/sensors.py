# SHEM/sensors.py
import random

class CategorySensor:
    """
    Simulates a sensor for a specific energy usage category (monthly).
    """
    def __init__(self, category_name, base_usage):
        """
        :param category_name: e.g., "Heating", "Lighting"
        :param base_usage: A nominal usage (kWh) for a month
        """
        self.category_name = category_name
        self.base_usage = base_usage

    def read_data(self):
        """
        Simulate reading usage data for this category for one month.
        We also simulate a small chance of sensor malfunction.
        """
        # 5% chance the sensor fails
        if random.random() < 0.05:
            raise ValueError(f"Sensor malfunction for category {self.category_name}")

        # Create random fluctuation around the base usage (±10%)
        fluctuation = random.uniform(-0.1, 0.1)
        usage = self.base_usage * (1 + fluctuation)
        return max(usage, 0)  # Ensure we don't return negative usage
