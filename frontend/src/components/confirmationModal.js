import { createPortal } from "react-dom";
import '../styles/confirmationModal.css';

function ConfirmModal({ show, title, message, onConfirm, onCancel }) {

  if (!show) {
    return null;
  }

 return createPortal(
  <div className="modal-overlay">
    <div className="modal-box">

      <h3>{title}</h3>

      <p>{message}</p>

      <div className="modal-buttons">
        <button onClick={onCancel} className="cancel-btn">
          Cancel
        </button>

        <button onClick={onConfirm} className="confirm-btn">
          Confirm
        </button>
      </div>

    </div>
  </div>,
  document.body
);
}

export default ConfirmModal;