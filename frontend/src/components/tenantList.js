import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../api/apiClient";
import AddTenantModal from "./addTenant";
import "../styles/tenantList.css";

function TenantList(){
    const { pgId } = useParams()
    const navigate=useNavigate()
    const [pgData, setPgData] = useState();
    const [showAddTenant, setShowAddTenant] = useState(false);
    const [tenants, setTenants]=useState([]);

    const fetchPg = async () => {
        const res = await authFetch(`http://localhost:8000/api/pgs/${pgId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }

    const fetchTenants = async () => {
        const res= await authFetch(`http://localhost:8000/api/tenants/?pg_property=${pgId}`)
        const data = await res.json();
        setTenants(data.results || data);
    }

    useEffect(() => {
        fetchPg();
        fetchTenants();
        
    }, [pgId]);

    return(
        <div className="tenant-list-container">
            <div className="tenant-list-nav-path">
                <span onClick={() => navigate("/")} className="tenant-list-navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="tenant-list-navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span>Tenants</span>

            </div>
             <div className="tenant-list-header">
                <h1>{pgData && pgData.name} - Tenant List</h1>
                <button className="add-tenant-btn" onClick={() => setShowAddTenant(true)}><b>+ Add Tenant</b></button>
                {showAddTenant && (
                    <AddTenantModal
                        pgId={pgId}
                        onAdd={
                            async (tenant) => {
                                setShowAddTenant(false);
                                await fetchTenants();
                                // fetchFloorCounts();
                            }
                        }
                        onClose={() => setShowAddTenant(false)}
                    />
                )}

                {/* {showEditModal && (
                    <EditRoomModal
                        room={editRoomData}
                        onUpdate={(updatedRoom) => {
                            updateRoom(updatedRoom);
                            setShowEditModal(false);
                        }}
                        onClose={() => setShowEditModal(false)}
                    />
                )} */}

            </div>

            <table>
                <thead>
                    <tr>
                        <th>Tenant Name</th>
                        <th>Room Number</th>
                        <th>Email</th>
                        <th>Join Date</th>
                        <th>Phone Number</th>
                        <th>Actions</th>
                    </tr>

                </thead>

                <tbody>
                    
                    {tenants.length===0?( <tr>
            <td colSpan="6" className="no-tenants-message">
                No Tenants Available
            </td>
        </tr>):(
                    tenants.map(tenant => (
                        <tr key={tenant.id}>
                            <td>{tenant.name}</td>
                            <td>{tenant.room}</td>
                            <td>{tenant.email}</td>
                            <td>{tenant.join_date}</td>
                            <td>{tenant.phone_number}</td>
                            <td>
                                <div className="action-column">
                                    {/* <FaTrash className="delete-room-button"
                                        onClick={() => {
                                            setShowDeleteConfirmModal(true)
                                            setRoomToDelete(room.id)
                                        }}
                                    />

                                    <FaPen className="edit-room-button"
                                        onClick={() => openEditRoom(room)}
                                    /> */}

                                </div>
                                {/* <ConfirmModal
                                    show={showDeleteConfirmModal}
                                    title="Delete Room"
                                    message="Are you sure you want to delete this room? The action once done can not be reverted."
                                    onConfirm={() => handleDeleteRoom(roomToDelete)}
                                    onCancel={() => setShowDeleteConfirmModal(false)}
                                /> */}
                            </td>   
                        </tr>
                    )))}
                </tbody>
            </table>

        </div>
    )
}

export default TenantList;