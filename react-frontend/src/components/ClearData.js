import React, { useState } from 'react';
import axios from 'axios';
import Card from './UI/Card';
import LoadingSpinner from './UI/LoadingSpinner';
import ErrorModal from './UI/ErrorModal';
import Modal from './UI/Modal';

function ClearData() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const openClearModal = () => {
    // Provide a warning message
    setModalMessage(
      'WARNING: This will permanently remove all readings from the database. Are you sure you want to proceed?'
    );
    setShowClearModal(true);
  };

  // Called when user confirms in the modal
  const confirmClear = async () => {
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
      setShowClearModal(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <Card>
      <ErrorModal error={error} onClear={clearError} />
      {loading && <LoadingSpinner asOverlay />}

      <h2>Clear All Data</h2>
      <p>Warning: This will permanently remove all readings from the database.</p>
      <button onClick={openClearModal}>Clear Data</button>

      {/* Show any server response messages */}
      {message && <p>{message}</p>}

      {/* Confirmation Modal */}
      {showClearModal && (
        <Modal
          show={showClearModal}
          onCancel={() => setShowClearModal(false)}
          header="Clear All Data"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-start', gap: '1rem' }}>
              <button type='button' onClick={() => setShowClearModal(false)}>Cancel</button>
              <button type='button' onClick={confirmClear}>Confirm</button>
            </div>
          }
        >
          <p>{modalMessage}</p>
        </Modal>
      )}
    </Card>
  );
}

export default ClearData;
