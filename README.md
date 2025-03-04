Smart Home Energy Monitor (MongoDB Version) – v2.0
This project simulates a monthly smart home energy monitoring system using Python, Flask, and MongoDB Atlas. It provides a React front-end for visualizing energy usage, cost, and predictions, and uses scikit-learn for basic predictive analytics.

Key Features
Monthly Simulation
Each simulation run advances the month by one from the latest date in the database (or uses the current date if none exist).
Usage is randomized per sensor.
Cost is calculated from usage at a realistic rate (e.g., $0.12/kWh).
HVAC is added as a separate sensor category.
Data Storage in MongoDB
Readings are stored with a simulation_date (e.g., "2025-03-01") instead of full timestamps.
Data is grouped and aggregated by month for simpler breakdowns and charts.
Prediction Model
A Linear Regression model is trained on historical monthly totals (usage vs. month index).
If there is insufficient data (fewer than two months of history), the model remains untrained and predictions are unavailable.
Flask API Endpoints
POST /simulate: Generates and logs readings for the next month.
GET /readings?month=YYYY-MM-DD: Fetches usage/cost data for a given month (or latest if omitted).
DELETE /clear_readings: Clears all readings in the database.
GET /history: Returns aggregated usage/cost for each simulated month (for charts).
GET /predict?month=YYYY-MM-DD: Predicts monthly usage if enough data is available.
GET /suggestions?usage=: Provides energy-saving suggestions based on a usage value.
React Front-End
Home: Displays summary charts (cost vs. month, usage vs. month) using Recharts.
Readings: Shows data for the most recent (or selected) month and offers a "Simulate Next Month" button to generate new data.
Breakdown: Displays usage/cost per category for a chosen month.
Predict: Allows users to enter a future month (e.g., "2025-05-01") to see a usage forecast.
Suggestions: Returns tips for reducing energy consumption based on current usage.
Clear Data: Deletes all readings in the database.
Uses Cards, Modals, and Loading Spinners for a polished UI.
Installation & Setup
1. Clone the Repository
Make sure you switch to the version-2.0 branch:

bash
Copy
git clone https://github.com/nnadede/ENGM4602Project_ND_Temi.git
cd smart_home_energy_monitor
git checkout version-2.0
2. Configure MongoDB Atlas
In SHEM/db_handler.py, update the URI with your MongoDB Atlas credentials. By default, the code uses:

python
Copy
uri = "mongodb+srv://<username>:<password>@cluster0.txypd.mongodb.net/?retryWrites=true&w=majority"
and stores data in the smart_home_energy_monitor database.

3. Install Python Dependencies
In the project root (where requirements.txt resides), run:

bash
Copy
pip install -r requirements.txt
4. Run the Flask Backend
From the project root, start the Flask server:

bash
Copy
python -m SHEM.flask_app
By default, it listens on http://127.0.0.1:5000.

5. Install and Run the React Front-End
Inside the react-frontend folder, run:

bash
Copy
cd react-frontend
npm install
npm start
This starts a development server on http://localhost:3000.

Usage
Simulate Data:
Go to the Readings section in the React app and click “Simulate Next Month”. This creates new sensor data for the next month and logs it in MongoDB.

View Readings:
The Readings page shows the latest month’s usage and cost per category. You can also query older months by adding ?month=YYYY-MM-DD to the GET /readings endpoint or adjusting the UI.

Check Breakdown:
The Breakdown page displays usage/cost distribution by category for a selected month.

Predict Future Usage:
In the Predict section, enter a future month (e.g., "2025-05-01"). If enough data (≥2 months) is available, the app returns a forecasted monthly usage.

Suggestions:
The Suggestions section accepts a numeric usage value and returns tips for reducing energy consumption.

Clear Data:
The Clear Data page (or the DELETE /clear_readings endpoint) wipes the database, allowing you to restart simulations from scratch.

Notes & Future Extensions
Single-User Focus:
Currently designed for a single household or user. Future iterations may add user authentication and multi-user data segregation.

Date Handling:
This version uses simple logic to move from one month to the next. Real-world date edge cases (e.g., 31-day months) are minimally handled.

Enhanced Predictive Modeling:
Additional features (e.g., weather data, day-of-week patterns) can be integrated for more accurate forecasting.

Deployment:
For production, configure environment variables for your MongoDB credentials and use a production server (e.g., gunicorn or uwsgi) with Flask.
