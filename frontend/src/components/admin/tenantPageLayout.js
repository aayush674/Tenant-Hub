import { useParams, Outlet, NavLink } from "react-router-dom";
import "../../styles/tenantLayout.css";

function TenantPageLayout() {
  const { pgId, tenantId } = useParams();

  return (
    <div className="tenant-layout-container">
      <aside className="tenant-sidebar">
        <NavLink to={`/pg/${pgId}/tenants/${tenantId}`} end>
          Details
        </NavLink>

        <NavLink to={`/pg/${pgId}/tenants/${tenantId}/dues`} end>
          Dues
        </NavLink>
      </aside>

      <main className="tenant-content">
        <Outlet />
      </main>
    </div>
  );
}

export default TenantPageLayout;
