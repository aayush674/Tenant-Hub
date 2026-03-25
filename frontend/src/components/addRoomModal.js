import { useState } from "react";
import { authFetch } from "../api/apiClient";
import "../styles/addRoomModal.css";


function AddRoomModal({pgId, onAdd, onClose}){

    const [roomNumber, setRoomNumber] = useState("");
    const [roomCapacity, setCapacity] = useState("");
    const [roomRent, setRent] = useState("");
    const [roomBalcony, setRoomBalcony] = useState(false);

     const [closing, setClosing] = useState(false);

    const handleClose = () => {
        setClosing(true);

        setTimeout(() => {
            onClose();
        }, 300); // must match CSS transition
    };

    const handleSubmit = async (e)=>{
        e.preventDefault();

        const res = await authFetch("http://localhost:8000/api/rooms/",{
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                pg_property: pgId,
                room_number: roomNumber,
                capacity: roomCapacity,
                rent: roomRent,
                is_balcony_room: roomBalcony
            })
        });

        const data= await res.json();
        onAdd(data);    
    }


    return(
        <div className="add-room-modal-overlay">
           <div
                className={`add-room-modal-box ${closing ? "close" : "open"}`}
                onClick={(e) => e.stopPropagation()}
            >
                <h1 className="modal-header">Add Room</h1>
                <form>
                    <div>Room Number</div>
                    <input 
                        placeholder="Enter Room Number"
                        value={roomNumber}
                        onChange={e => setRoomNumber(e.target.value)}
                    />
                    
                    <br/>
                    <div>Room Occupancy Type: </div>
                    <div className="occupancy-toggle">
                        
                        <button type="button" className={roomCapacity===1?"active":""} onClick={()=> setCapacity(1)}>👤Single</button>
                        <button type="button" className={roomCapacity===2?"active":""} onClick={()=> setCapacity(2)}>👥Double</button>
                        
                    </div>
                    <br/>
                    <div className="balcony-checkbox">
                    <input type="checkbox" checked={roomBalcony} onChange={e => setRoomBalcony(e.target.checked)} />
                    <label>Balcony room</label>
                    </div>
                    <br />

                    <div>Room Rent</div>
                    <input 
                        placeholder="Enter Room Rent"
                        value={roomRent}
                        onChange={e => setRent(e.target.value)}
                    />
                    <br/>

                    <button type="submit" onClick={handleSubmit}>Add Room</button>
                    <button type="button" onClick={onClose}>Cancel</button>
                </form>
            </div>
        </div>
    )
}

export default AddRoomModal;