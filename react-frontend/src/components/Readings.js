import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';
import Modal from './UI/Modal';

const formatMonthYear = (dateStr) => {
  if (!dateStr) return '';
  const parts = dateStr.split("-"); //dateStr is in the format "YYYY-MM-DD"
  const year = parts[0];
  const month = parts[1];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;//month is 1-based index in JS Date object but 0-based in monthNames array 
};

function Readings() {
  const [data, setData] = useState(null);
  const [simulationDate, setSimulationDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  // Fetch latest readings on mount
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
      setData(response.data.readings);
      setSimulationDate(response.data.simulation_date);
    } catch (err) {
      setError('Simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  // Open modal with a warning message
  const openClearModal = () => {
    setModalMessage('WARNING: This action will permanently delete all readings from the database. Are you sure you want to proceed?');
    setShowClearModal(true);
  };

  // Confirm clearing data and update UI
  const confirmClear = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.delete('http://127.0.0.1:5000/clear_readings');
      // Update modal message based on response
      if (response.data.message) {
        setModalMessage(response.data.message);
      } else {
        setModalMessage('No data to clear.');
      }
      // Refresh readings after clearing
      fetchLatestReadings();
    } catch (err) {
      setModalMessage('Error clearing data.');
    } finally {
      setLoading(false);
      setShowClearModal(false);
    }
  };

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}
      <h2>Monthly Readings</h2>
      {simulationDate && <p>Current Month: {formatMonthYear(simulationDate)}</p>}
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
      <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
        <button type='button' onClick={simulateNextMonth}>Simulate Next Month</button>
        <button type='button' onClick={openClearModal}>Clear All Data</button>
      </div>
      {showClearModal && (
        <Modal
          show={showClearModal}
          onCancel={() => setShowClearModal(false)}
          header="Clear All Data"
          footer={
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
                <button type='button' onClick={() => setShowClearModal(false)}>Cancel</button>
                <button type='button' onClick={confirmClear}>Confirm</button>
              </div>
            </>
          }
        >
          <p>{modalMessage}</p>
        </Modal>
      )}
    </Card>
  );
}

export default Readings;
