import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../../api/apiClient";
import { API_BASE_URL } from "../../config";
import { useParams } from "react-router-dom";

import "../../styles/common_styles/navigator.css";

function TenantWiseDues() {

    const navigate = useNavigate();
    const { pgId, tenantId } = useParams();
    const [pgData, setPgData] = useState();
    const [tenantDues, setTenantDues] = useState([]);
    const [tenantData, setTenantData] = useState({});

    const fetchTenantDues = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/dues/?tenant=${tenantId}`)
        const data = await res.json();
        setTenantDues(data.results || data);
    }, [tenantId]);

    const fetchPg = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/pgs/${pgId}/`);
        if (!res.ok) {
            throw new Error("Failed to fetch PG");
        }
        const data = await res.json();
        setPgData(data);
    }, [pgId]);

    const fetchCurrentTenant = useCallback(async () => {
        const res = await authFetch(`${API_BASE_URL}/api/tenants/${tenantId}`);
        if (!res.ok) {
            throw new Error("Failed to fetch Tenant");
        }
        const data = await res.json();
        setTenantData(data);
    }, [tenantId]);

    useEffect(() => {
        fetchPg();
        fetchCurrentTenant();
        fetchTenantDues();
    }, [fetchPg, fetchCurrentTenant, fetchTenantDues]);
    return (
        <div className="tenant-dues-container">
            <div className="nav-path">
                <span onClick={() => navigate("/")} className="navigator">Home</span>
                <span className="seperator"> / </span>
                <span onClick={() => navigate("/pg-list")} className="navigator">PG List</span>
                <span className="seperator"> / </span>
                {pgData && <span>{pgData.name}</span>}
                <span className="seperator"> / </span>
                <span onClick={() => navigate(`/pg/${pgId}/tenants`)} className="navigator">Tenants</span>
                <span className="seperator"> / </span>
                {tenantData && <span>{tenantData.first_name + " " + tenantData.last_name}</span>}
                <span className="seperator"> / </span>
                <span>Dues</span>

            </div>
            <div className="tenant-dues-header">
                <h1>Tenant {tenantData && tenantData.first_name + " " + tenantData.last_name + " - Dues"}</h1>
            </div>
        </div>
    )
}

export default TenantWiseDues;