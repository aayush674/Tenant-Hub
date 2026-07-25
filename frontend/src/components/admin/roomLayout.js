import { useParams, Outlet, NavLink } from "react-router-dom";
import "../../styles/roomLayout.css";
import { FaBed, FaTools } from "react-icons/fa";

const navItems = [
    { to: "", end: true, icon: <FaBed />, label: "Room Details" },
    { to: "/maintainence", end: true, icon: <FaTools />, label: "Maintainence" }
];

function RoomLayout() {
    const { pgId, roomId } = useParams();

    return (
        <div className="room-layout-container">
            <div className="room-sidebar">
                {navItems.map(({ to, end, icon, label }) => (
                    <NavLink
                        key={label}
                        to={`/pg/${pgId}/rooms/${roomId}${to ? `/${to}` : ""}`}
                        end={end}
                    >
                        {icon}
                        <span>{label}</span>
                    </NavLink>
                ))}
            </div>

            <div className="room-content">
                <Outlet />
            </div>
        </div>
    );
}

export default RoomLayout;