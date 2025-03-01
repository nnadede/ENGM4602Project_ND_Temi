<<<<<<< HEAD
# Smart Home Energy Monitor (MongoDB Version)

This project simulates a smart home energy monitoring system using Python, Flask, and MongoDB, **randomizing** the total monthly usage and cost for each run.

## Features

1. **Category-Based Sensors**  
   - Simulates usage for categories like Heating, Water Heating, Lighting, etc.
   - Distributes total monthly usage (random between 3000-5000 kWh) and total cost (random between $700-$1000) among categories.

2. **Data Storage in MongoDB**  
   - Each reading is stored in a MongoDB collection (`readings`).

3. **Prediction Model**  
   - A simple Linear Regression model (scikit-learn) predicts future total usage based on timestamp.

4. **Flask Web App**  
   - **`/readings`**: Generates and logs a new set of simulated data.  
   - **`/predict`**: Returns predicted usage for a given timestamp.  
   - **`/suggestions`**: Provides more advanced energy-saving tips based on current usage.  
   - **`/breakdown`**: Shows an aggregated usage/cost breakdown by category.

## Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/smart_home_energy_monitor.git
   cd smart_home_energy_monitor






   # Smart Home Energy Monitor with MongoDB Atlas

This project simulates a smart home energy monitoring system using Python, Flask, and MongoDB **Atlas**.  
It uses **no schema enforcement** (unlike Mongoose in Node.js).

## Features

1. **Category-Based Sensors**  
   - Simulates usage for categories like Heating, Water Heating, Lighting, etc.
   - Random total monthly usage (3,000–5,000 kWh) and cost (US$700–1,000).

2. **Data Storage in MongoDB Atlas**  
   - Each reading is stored in the `smart_home_energy_monitor_atlas` database (or whichever name you choose).
   - No schema enforcement required.

3. **Prediction Model**  
   - A simple Linear Regression model (scikit-learn) predicts future total usage based on timestamp.

4. **Flask Web App**  
   - **`/readings`**: Generates and logs a new set of simulated data.  
   - **`/predict`**: Returns predicted usage for a given timestamp.  
   - **`/suggestions`**: Provides more advanced energy-saving tips based on usage.  
   - **`/breakdown`**: Shows an aggregated usage/cost breakdown by category.

## Installation

1. **Clone the repository**  
   ```bash
   git clone https://github.com/yourusername/smart_home_energy_monitor.git
   cd smart_home_energy_monitor

=======
# ENGM4602
>>>>>>> fcf2b8ae2f1385f726b9fecdec2f093f5a021a7b
