import { useState } from "react";
import "../styles/roomListFilterModal.css";

function RoomListFilterModal({ isOpen, onClose, filters, setFilters, onApply, onReset }) {
    const [error, setError] = useState({});


    return (
        <div className={`filter-modal-container ${isOpen ? "show" : "hide"}`}>
            <div className={`filter-modal-box ${isOpen ? "open" : ""}`}>
                <h1 className="modal-header">Filters</h1>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    const validations = validateErrors(filters);
                    if (Object.keys(validations).length > 0) {
                        setError(validations);
                        return;
                    }
                    setError({});
                    onApply();
                }}>

                    <div className="filters-container">
                        <div className="filter-heading">Room Rent</div>
                        <div className="filter-field">
                            <input placeholder="Minimum Rent"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                            /> <span> - </span>
                            <input placeholder="Maximum Rent"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                            />

                        </div>
                        {error.minPrice && <span className="errors">{error.minPrice}</span>}
                        {error.maxPrice && <span className="errors">{error.maxPrice}</span>}
                        {error.range && <span className="errors">{error.range}</span>}
                        <br /><br />
                        <div className="occupancy-toggle-container">
                            <div className="filter-heading">Room Capacity</div>
                            <div className="filter-field">
                                <button type="button" className={filters.occupancyType === 1 ? "active" : ""} onClick={() => setFilters({ ...filters, occupancyType: filters.occupancyType===1?"": 1})}>👤Single</button>
                                <button type="button" className={filters.occupancyType === 2 ? "active" : ""} onClick={() => setFilters({ ...filters, occupancyType: filters.occupancyType===2?"": 2 })}>👥Double</button>
                            </div>

                        </div>

                    </div>
                    <div className="filter-modal-buttons">
                        <button type="submit">Apply</button>
                        <button type="button" onClick={onClose}>Close</button>
                        <button type="submit" onClick={onReset}>Reset</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function validateErrors(filters) {
    const errors = {};
    const min = filters.minPrice;
    const max = filters.maxPrice;

    if (min && isNaN(min)) {
        errors.minPrice = "Min Price must be a valid number";
    }
    if (max && isNaN(max)) {
        errors.maxPrice = "Max Price must be a valid number";
    }
    if (min && Number(min) < 0) {
        errors.minPrice = "Price cannot be negative";
    }
    if (max && Number(max) < 0) {
        errors.maxPrice = "Price cannot be negative";
    }
    if (min && max && Number(min) > Number(max)) {
        errors.range = "Min Price cannot be greater than Max Price";
    }
    return errors;
}

export default RoomListFilterModal;