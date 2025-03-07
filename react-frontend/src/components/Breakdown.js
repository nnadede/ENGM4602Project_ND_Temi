// src/components/Breakdown.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';
import './Breakdown.css';

function Breakdown() {
  const [data, setData] = useState(null);
  const [monthInput, setMonthInput] = useState(''); // for user input (YYYY-MM)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBreakdown = async (monthParam = '') => {
    setLoading(true);
    setError(null);
    try {
      // If a month is provided, pass it as a query parameter; otherwise, backend defaults to latest month.
      const response = await axios.get('http://127.0.0.1:5000/breakdown', {
        params: { month: monthParam }
      });
      if (response.data.data) {
        setData(response.data.data);
      } else {
        setError(response.data.message || "No breakdown data available.");
      }
    } catch (err) {
      setError('Error fetching breakdown data.');
    } finally {
      setLoading(false);
    }
  };

  // On initial mount, fetch breakdown for the latest month.
  useEffect(() => {
    fetchBreakdown();
  }, []);

  const handleSearch = () => {
    // The user only needs to input "YYYY-MM". We'll pass that to the backend.
    if (monthInput.trim() === '') {
      fetchBreakdown();
    } else {
      fetchBreakdown(monthInput.trim());
    }
  };

  const clearError = () => setError(null);

  return (
    <div className="breakdown-container">
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Monthly Breakdown & Suggestions</h2>
      <div className="search-group">
        <label htmlFor="month-input">Enter Year & Month (YYYY-MM): </label>
        <input
          id="month-input"
          type="text"
          value={monthInput}
          onChange={(e) => setMonthInput(e.target.value)}
          placeholder="e.g., 2026-02"
        />
        <button type="button" onClick={handleSearch}>Search</button>
      </div>
      {data ? (
        <>
          <Card className="breakdown-card">
            <h3>Breakdown for {data.simulation_date}</h3>
            <p>Total Usage: {data.total_usage.toFixed(2)} kWh</p>
            <p>Total Cost: ${data.total_cost.toFixed(2)}</p>
            <table className="breakdown-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Usage (kWh)</th>
                  <th>Usage (%)</th>
                  <th>Cost ($)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.breakdown_by_category).map(([cat, info], index) => (
                  <tr key={index}>
                    <td>{cat}</td>
                    <td>{info.usage.toFixed(2)}</td>
                    <td>{info.usage_percentage.toFixed(2)}%</td>
                    <td>{info.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <Card className="suggestions-card">
            <h3>
              Efficiency Rating:{" "}
              <span className={`rating rating-${data.efficiency_rating.toLowerCase()}`}>
                {data.efficiency_rating}
              </span>
            </h3>
            <ul>
              {data.suggestions.map((s, index) => (
                <li key={index}>{s}</li>
              ))}
            </ul>
          </Card>
        </>
      ) : (
        !loading && <p>No breakdown available. Try entering a valid year and month or start simulation.</p>
      )}
    </div>
  );
}

export default Breakdown;
