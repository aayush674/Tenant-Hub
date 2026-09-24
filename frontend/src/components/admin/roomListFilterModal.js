import { useState } from "react";
import "../../styles/roomListFilterModal.css";
import { FaTimes, FaUser, FaUserFriends } from "react-icons/fa";

function RoomListFilterModal({
  isOpen,
  onClose,
  filters,
  setFilters,
  onApply,
  onReset,
}) {
  const [error, setError] = useState({});

  const clearFieldError = (field) => {
    if (error?.[field]) {
      const newError = { ...error };
      delete newError[field];
      setError(newError);
    }
  };

  const handleReset = () => {
    setError({});
    onReset();
  };

  return (
    <div
      className={`filter-modal-container ${isOpen ? "show" : "hide"}`}
      onClick={onClose}
    >
      <div
        className={`filter-modal-box ${isOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-top">
          <h1 className="modal-header">Filters</h1>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const validations = validateErrors(filters);
            if (Object.keys(validations).length > 0) {
              setError(validations);
              return;
            }
            setError({});
            onApply();
          }}
        >
          <div className="filters-container">
            <div className="filter-group">
              <div className="filter-heading">Room rent (₹)</div>
              <div className="filter-field">
                <input
                  placeholder="Minimum"
                  value={filters.minPrice}
                  onChange={(e) => {
                    setFilters({ ...filters, minPrice: e.target.value });
                    clearFieldError("minPrice");
                    clearFieldError("range");
                  }}
                />
                <span className="range-separator">–</span>
                <input
                  placeholder="Maximum"
                  value={filters.maxPrice}
                  onChange={(e) => {
                    setFilters({ ...filters, maxPrice: e.target.value });
                    clearFieldError("maxPrice");
                    clearFieldError("range");
                  }}
                />
              </div>
              {error.minPrice && (
                <div className="error-container">{error.minPrice}</div>
              )}
              {error.maxPrice && (
                <div className="error-container">{error.maxPrice}</div>
              )}
              {error.range && (
                <div className="error-container">{error.range}</div>
              )}
            </div>

            <div className="filter-group">
              <div className="filter-heading">Room capacity</div>
              <div className="occupancy-toggle">
                <button
                  type="button"
                  className={filters.occupancyType === 1 ? "active" : ""}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      occupancyType: filters.occupancyType === 1 ? "" : 1,
                    })
                  }
                >
                  <FaUser aria-hidden="true" /> Single
                </button>
                <button
                  type="button"
                  className={filters.occupancyType === 2 ? "active" : ""}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      occupancyType: filters.occupancyType === 2 ? "" : 2,
                    })
                  }
                >
                  <FaUserFriends aria-hidden="true" /> Double
                </button>
              </div>
            </div>
          </div>

          <div className="filter-modal-buttons">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleReset}
            >
              Reset
            </button>
            <button type="submit" className="btn-primary">
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function validateErrors(filters) {
  const errors = {};
  const min = filters.minPrice;
  const max = filters.maxPrice;

  if (min && isNaN(min)) {
    errors.minPrice = "Min price must be a valid number.";
  }
  if (max && isNaN(max)) {
    errors.maxPrice = "Max price must be a valid number.";
  }
  if (min && Number(min) < 0) {
    errors.minPrice = "Price cannot be negative.";
  }
  if (max && Number(max) < 0) {
    errors.maxPrice = "Price cannot be negative.";
  }
  if (min && max && !isNaN(min) && !isNaN(max) && Number(min) > Number(max)) {
    errors.range = "Min price cannot be greater than max price.";
  }
  return errors;
}

export default RoomListFilterModal;
