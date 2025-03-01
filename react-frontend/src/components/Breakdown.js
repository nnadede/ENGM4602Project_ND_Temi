import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Breakdown() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBreakdown = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/breakdown');
      setData(response.data);
    } catch (err) {
      setError('Error fetching breakdown');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBreakdown();
  }, []);

  return (
    <div className="breakdown">
      <h2>Usage & Cost Breakdown</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {data && data.breakdown ? (
        <div>
          <table className="breakdown-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Usage (kWh)</th>
                <th>Total Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              {data.breakdown.map((item, index) => (
                <tr key={index}>
                  <td>{item.category}</td>
                  <td>{item.usage.toFixed(2)}</td>
                  <td>{item.cost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>Grand Total Usage: {data.total_usage_kwh.toFixed(2)} kWh</p>
          <p>Grand Total Cost: ${data.total_cost_usd.toFixed(2)}</p>
        </div>
      ) : (
        <p>No breakdown available.</p>
      )}
      <button onClick={fetchBreakdown}>Refresh Breakdown</button>
    </div>
  );
}

export default Breakdown;
