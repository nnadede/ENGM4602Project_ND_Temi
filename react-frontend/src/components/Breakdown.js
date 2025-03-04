import React, { useState } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

function Breakdown() {
  const [month, setMonth] = useState('');
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Expecting month input in "YYYY-MM" format
  const fetchBreakdown = async (selectedMonth) => {
    setLoading(true);
    setError(null);
    setReadings([]);
    try {
      const response = await axios.get('http://127.0.0.1:5000/readings', { params: { month: selectedMonth } });
      if (response.data.message && response.data.readings.length === 0) {
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

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Monthly Breakdown</h2>
      <div div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <label>Year and Month (YYYY-MM): </label>
        <input
          type="text"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          placeholder="YYYY-MM"
        />
        <button onClick={() => fetchBreakdown(month)}>Get Breakdown</button>
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
        </>
      )}
      {readings.length === 0 && !loading && !error && (
        <p>No breakdown available. Try entering a valid year and month or simulate data.</p>
      )}
    </Card>
  );
}

export default Breakdown;
