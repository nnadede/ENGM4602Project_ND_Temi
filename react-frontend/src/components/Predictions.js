import React, { useState } from 'react';
import axios from 'axios';

function Predictions() {
  const [timestamp, setTimestamp] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const fetchPrediction = async () => {
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/predict', {
        params: { timestamp }
      });
      setPrediction(response.data.predicted_usage);
    } catch (err) {
      setError('Error fetching prediction');
    }
  };

  return (
    <div className="predictions">
      <h2>Predict Energy Usage</h2>
      <div>
        <label>
          Timestamp:
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="YYYY-MM-DDTHH:MM:SS"
          />
        </label>
      </div>
      <button onClick={fetchPrediction}>Predict</button>
      {prediction !== null && (
        <p>Predicted Usage: {prediction.toFixed(2)} kWh</p>
      )}
      {error && <p>{error}</p>}
    </div>
  );
}

export default Predictions;
