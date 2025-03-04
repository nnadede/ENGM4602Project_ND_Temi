import React, { useState } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';

function ClearData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  const clearDatabase = async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const response = await axios.delete('http://127.0.0.1:5000/clear_readings');
      if (response.data.message) {
        setMessage(response.data.message);
      } else {
        setError(response.data.error || 'Unknown error.');
      }
    } catch (err) {
      setError('Error clearing data.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Clear All Data</h2>
      <p>Warning: This will permanently remove all readings from the database.</p>
      <button onClick={clearDatabase}>Clear Readings</button>
      {message && <p>{message}</p>}
    </Card>
  );
}

export default ClearData;
