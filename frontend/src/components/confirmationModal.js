import React from "react";
import '../styles/confirmationModal.css';

function ConfirmModal({ show, title, message, onConfirm, onCancel }) {

  if (!show) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">

        <h3>{title}</h3>

        <p>{message}</p>

        <div className="modal-buttons">
          <button onClick={onConfirm} className="confirm-btn">
            Confirm
          </button>

          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}

export default ConfirmModal;