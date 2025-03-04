import React, { useState } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

function Predictions() {
  const [month, setMonth] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/predict', {
        params: { month }
      });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setPrediction(response.data.predicted_usage_kwh);
      }
    } catch (err) {
      setError('Error fetching prediction');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Predict Energy Usage</h2>
      <div>
        <label>
          Target Month (YYYY-MM-DD):
          <input
            type="text"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="2025-05-01"
          />
        </label>
      </div>
      <button onClick={fetchPrediction}>Predict</button>
      {prediction !== null && (
        <p>Predicted Usage: {prediction.toFixed(2)} kWh</p>
      )}
    </Card>
  );
}

export default Predictions;
