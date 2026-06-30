import { Outlet, NavLink } from "react-router-dom";
import "../../styles/tenantLayout.css";
function TenantLayout(){
    // const {pgId} = useParams();
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