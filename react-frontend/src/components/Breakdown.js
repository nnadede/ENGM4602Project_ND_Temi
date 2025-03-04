import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

function Breakdown() {
  const [month, setMonth] = useState('');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBreakdown = async () => {
    setLoading(true);
    setError(null);
    setReadings([]);
    try {
      // We'll re-use the /readings endpoint with ?month=
      const response = await axios.get('http://127.0.0.1:5000/readings', {
        params: { month }
      });
      if (response.data.message && response.data.readings.length === 0) {
        // No data for that month
        setError(response.data.message);
      } else {
        setReadings(response.data.readings);
      }
    } catch (err) {
      setError('Error fetching breakdown');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Optionally, fetch the latest by default on mount
  useEffect(() => {
    // fetchBreakdown();
  }, []);

  const totalUsage = readings.reduce((sum, r) => sum + r.usage, 0);
  const totalCost = readings.reduce((sum, r) => sum + r.cost, 0);

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Monthly Breakdown</h2>
      <div>
        <label>Month (YYYY-MM-DD): </label>
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="2025-05-01"
        />
        <button onClick={fetchBreakdown}>Get Breakdown</button>
      </div>
      {readings.length > 0 && (
        <>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Usage (kWh)</th>
                <th>Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              {readings.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{item.usage.toFixed(2)}</td>
                  <td>{item.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Total Usage:</strong> {totalUsage.toFixed(2)} kWh</p>
          <p><strong>Total Cost:</strong> ${totalCost.toFixed(2)}</p>
        </>
      )}
      {readings.length === 0 && !loading && !error && (
        <p>No breakdown available. Try entering a valid month or simulate data.</p>
      )}
    </Card>
  );
}

export default Breakdown;
