import { useParams, Outlet, NavLink, useLocation } from "react-router-dom";
import { FaUsers, FaCreditCard, FaReceipt, FaDoorOpen, FaBuilding, FaLayerGroup } from "react-icons/fa";
import "../../styles/pgLayout.css";
import IconTooltip from "../common/iconTooltip";

const navItems = [
    { to: "", end: true, icon: <FaBuilding />, label: "PG Details" },
    { to: "rooms", icon: <FaDoorOpen />, label: "Rooms List" },
    { to: "roomtypes", icon: <FaLayerGroup />, label: "Room Templates" },
    { to: "tenants", icon: <FaUsers />, label: "Tenants" },
    { to: "dues", icon: <FaReceipt />, label: "Dues" },
    { to: "payments", icon: <FaCreditCard />, label: "Payments" },
];

function PGLayout() {
    const { pgId } = useParams();
    const location = useLocation();

    const collapsed =
        location.pathname.includes("/rooms/") ||
        location.pathname.includes("/tenants/");

    return (
        <div className="pg-layout-container">
            <div className={`pg-sidebar ${collapsed ? "collapsed" : ""}`}>
                {navItems.map(({ to, end, icon, label }) => {
                    const link = (
                        <NavLink
                            key={label}
                            to={`/pg/${pgId}${to ? `/${to}` : ""}`}
                            end={end}
                        >
                            {icon}
                            <span>{label}</span>
                        </NavLink>
                    );

                    return collapsed ? (
                        <IconTooltip key={label} label={label}>
                            {link}
                        </IconTooltip>
                    ) : (
                        link
                    );
                })}
            </div>
            <div className="content">
                <Outlet />
            </div>
        </div>
    );
}

export default PGLayout;