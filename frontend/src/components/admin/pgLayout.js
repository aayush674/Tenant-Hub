import { useParams, Outlet, NavLink } from "react-router-dom";
import "../../styles/pgLayout.css";
function PGLayout(){
    const {pgId} = useParams();
    return(
        <div className="pg-layout-container">
            <div className="pg-sidebar">
                <NavLink to={`/pg/${pgId}`} end>Details</NavLink>
                <NavLink to={`/pg/${pgId}/rooms`}>Rooms List</NavLink>
                <NavLink to={`/pg/${pgId}/roomtypes`}>Room Templates</NavLink>
                <NavLink to={`/pg/${pgId}/tenants`}>Tenants</NavLink>
                <NavLink to={`/pg/${pgId}/dues`}>Dues</NavLink>
                <NavLink to={`/pg/${pgId}/payments`}>Payments</NavLink>     
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    )
}

export default PGLayout;