import React, { useState } from 'react';
import axios from 'axios';

function Suggestions() {
  const [usage, setUsage] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);

  const fetchSuggestions = async () => {
    setError(null);
    try {
      const response = await axios.get('http://127.0.0.1:5000/suggestions', {
        params: { usage }
      });
      setSuggestions(response.data.suggestions);
    } catch (err) {
      setError('Error fetching suggestions');
    }
  };

  return (
    <div className="suggestions">
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
      {error && <p>{error}</p>}
    </div>
  );
}

export default Suggestions;
