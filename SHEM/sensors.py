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

    def read_data(self, season="Spring", usage_range="moderate"):
        """
        Simulate reading usage data for this category for one month.
        Factors in sensor malfunction, base fluctuation, usage range multipliers,
        and seasonal adjustments.
        """
        # 5% chance the sensor fails
        if random.random() < 0.05:
            raise ValueError(f"Sensor malfunction for category {self.category_name}")

        # Base fluctuation (±10%)
        base_fluctuation = random.uniform(-0.1, 0.1)

        # Usage range multiplier based on selected scenario
        if usage_range == "low":
            range_multiplier = random.uniform(0.7, 0.9)
        elif usage_range == "moderate":
            range_multiplier = random.uniform(0.9, 1.0)
        elif usage_range == "above average":
            range_multiplier = random.uniform(1.0, 1.1)
        elif usage_range == "high":
            range_multiplier = random.uniform(1.1, 1.2)
        elif usage_range == "very high":
            range_multiplier = random.uniform(1.2, 1.3)
        elif usage_range == "alarming":
            range_multiplier = random.uniform(1.3, 1.5)
        else:
            range_multiplier = 1.0

        # Seasonal adjustment: boost for Heating/HVAC/Lighting in winter,
        # and occasional spikes in non-winter months.
        seasonal_adjustment = 1.0
        if season == "Winter" and self.category_name in ["Heating", "HVAC", "Lighting"]:
            seasonal_adjustment = random.uniform(1.1, 1.3)
        elif season in ["Spring", "Summer", "Fall"]:
            if random.random() < 0.1:  # 10% chance for a spike in other seasons
                seasonal_adjustment = random.uniform(1.2, 1.4)

        usage = self.base_usage * (1 + base_fluctuation) * range_multiplier * seasonal_adjustment
        return max(usage, 0)
