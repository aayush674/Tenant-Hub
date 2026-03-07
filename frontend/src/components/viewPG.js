import React from "react";
import '../styles/viewPG.css';
function ViewPG({ show, pg, onClose }) {

  if (!show || !pg) {
    return null;
  }

  return (
    <div className="modal-overlay">
    <div className="view-pg-modal">
      <h2><u>{pg.name}</u></h2>
      <p><strong>Location:</strong> {pg.address}</p>
      <p><strong>Number of Floors:</strong> {pg.total_floors}</p>
      <button onClick={onClose}>Close</button>
    </div>
    </div>
  );
}

export default ViewPG;