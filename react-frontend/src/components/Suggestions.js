import React, { useState } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

function Suggestions() {
  const [usage, setUsage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const response = await axios.get('http://127.0.0.1:5000/suggestions', {
        params: { usage }
      });
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setSuggestions(response.data.suggestions);
      }
    } catch (err) {
      setError('Error fetching suggestions');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Energy Saving Suggestions</h2>
      <div>
        <label>
          Current Usage (kWh):
          <input
            type="number"
            value={usage}
            onChange={(e) => setUsage(e.target.value)}
          />
        </label>
      </div>
      <button onClick={fetchSuggestions}>Get Suggestions</button>
      {suggestions.length > 0 && (
        <ul>
          {suggestions.map((s, index) => (
            <li key={index}>{s}</li>
          ))}
        </ul>
      )}
    </Card>
  );
}

export default Suggestions;
