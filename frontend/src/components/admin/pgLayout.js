import { useParams, Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaUsers, FaCreditCard, FaReceipt, FaDoorOpen, FaBuilding, FaLayerGroup, FaUndoAlt } from "react-icons/fa";
import "../../styles/pgLayout.css";
import IconTooltip from "../common/iconTooltip";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { useState, useEffect } from "react";

const navItems = [
    { to: "", end: true, icon: <FaBuilding />, label: "PG Details" },
    { to: "rooms", icon: <FaDoorOpen />, label: "Rooms List" },
    { to: "roomtypes", icon: <FaLayerGroup />, label: "Room Templates" },
    { to: "tenants", icon: <FaUsers />, label: "Tenants" },
    { to: "dues", icon: <FaReceipt />, label: "Dues" },
    { to: "payments", icon: <FaCreditCard />, label: "Payments" },
    { to: "refunds", icon: <FaUndoAlt />, label: "Refunds"}
];

function PGLayout() {
    const { pgId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const [pgs, setPgs] = useState([]);
    const [selectedPg, setSelectedPg] = useState(null);

    useEffect(() => {
        authFetch(`${API_BASE_URL}/api/pgs/`)
            .then((res) => res.json())
            .then((data) => {
                setPgs(data);
            })
            .catch((error) => {
                console.error("Error fetching PGs:", error);
            });
    }, []);

    const handlePgChange = async (e) => {
      const pgId = e.target.value;
      setSelectedPg(pgId ? Number(pgId) : null);
      navigate(`/pg/${pgId}`)
    };

    const collapsed =
        location.pathname.includes("/rooms/") ||
        location.pathname.includes("/tenants/");

    return (
      <div className="pg-layout-container">
        <div className={`pg-sidebar ${collapsed ? "collapsed" : ""}`}>
          <select
            id="pg-switcher"
            className="custom-select"
            value={selectedPg ?? ""}
            onChange={handlePgChange}
          >
            {pgs.map((pg) => (
              <option key={pg.id} value={pg.id}>
                {pg.name}
              </option>
            ))}
          </select>
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
