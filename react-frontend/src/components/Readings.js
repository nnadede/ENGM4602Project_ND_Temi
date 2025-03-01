import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Readings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchReadings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/readings');
      setData(response.data.data);
    } catch (err) {
      setError('Error fetching readings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadings();
  }, []);

  return (
    <div className="readings">
      <h2>Latest Readings</h2>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {data && data.length > 0 ? (
        <table className="readings-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Usage (kWh)</th>
              <th>Cost ($)</th>
            </tr>
          </thead>
          <tbody>
            {data.map((reading, index) => (
              <tr key={index}>
                <td>{reading.category}</td>
                <td>{reading.usage.toFixed(2)}</td>
                <td>{reading.cost.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No readings available.</p>
      )}
      <button onClick={fetchReadings}>Refresh Readings</button>
    </div>
  );
}

export default Readings;
