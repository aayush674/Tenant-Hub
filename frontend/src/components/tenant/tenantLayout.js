import { useNavigate, useParams, Outlet, NavLink } from "react-router-dom";
// import "../../styles/pgLayout.css";
function TenantLayout(){
    const navigate=useNavigate();
    const {pgId} = useParams();
    return(
        <div className="tenant-layout-container">
            <div className="tenant-sidebar">
                <NavLink to={`/t`} end>Dashboard</NavLink>
                <NavLink to={`/t/room`}>My Room</NavLink>
                <NavLink to={`/t/dues`}>Dues and Payments</NavLink>
                <NavLink to={`/t/maintenance`}>Maintenance</NavLink>
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    )
}

export default TenantLayout;