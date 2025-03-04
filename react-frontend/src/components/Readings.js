import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

function Readings() {
  const [data, setData] = useState(null);
  const [simulationDate, setSimulationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // By default, fetch the latest month if it exists
  useEffect(() => {
    fetchLatestReadings();
  }, []);

  const fetchLatestReadings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/readings');
      if (response.data.readings && response.data.readings.length > 0) {
        setData(response.data.readings);
        setSimulationDate(response.data.simulation_date);
      } else {
        setData([]);
        setSimulationDate('');
      }
    } catch (err) {
      setError('Error fetching readings.');
    } finally {
      setLoading(false);
    }
  };

  const simulateNextMonth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://127.0.0.1:5000/simulate');
      // response.data => { simulation_date, readings: [...] }
      setData(response.data.readings);
      setSimulationDate(response.data.simulation_date);
    } catch (err) {
      setError('Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Monthly Readings</h2>
      {simulationDate && <p>Current Month: {simulationDate}</p>}
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
      <button onClick={simulateNextMonth}>Simulate Next Month</button>
    </Card>
  );
}

export default Readings;
