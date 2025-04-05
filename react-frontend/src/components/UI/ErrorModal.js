import React from 'react';
import Modal from './Modal';

const ErrorModal = props => {
  return (
    <Modal
      onCancel={props.onClear}
      header="An Error Occurred!"
      show={!!props.error}
      footer={<button type='button' onClick={props.onClear}>Okay</button>}
    >
      <div className='error-container'>
        <div className="error-icon">!</div>
        <p className='error-text'>{props.error}</p>
      </div>
    </Modal>
  );
};

export default ErrorModal;
