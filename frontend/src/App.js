import "./App.css";
import Header from "./components/admin/header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PGList from "./components/admin/pgList";
import Login from "./components/common/login";
import RoomsList from "./components/admin/roomsList";
import RoomTypes from "./components/admin/roomTypes";
import TenantList from "./components/admin/tenantList";
import PGDetails from "./components/admin/pgDetails";
import PGLayout from "./components/admin/pgLayout";
import Dues from "./components/admin/dues";

import { ProtectedRoute } from "./api/protectedRoute";
import TenantRoom from "./components/tenant/tenantRoom";
import TenantDashboard from "./components/tenant/tenantDashboard";
import TenantDues from "./components/tenant/tenantDues";
import TenantMaintainence from "./components/tenant/tenantMaintainence";
import TenantLayout from "./components/tenant/tenantLayout";
import TenantHeader from "./components/tenant/tenantHeader";

function App() {
  return (

    <div className="page-box">


    </div>

  );
}

function Layout() {
  const location = useLocation();
  const isTenantRoute = location.pathname.startsWith("/t");
  // useLocation(), useNavigate() and useParams() must be used within router components else these wouldn't be identified if initialized before browser router. So we created this Layout component to render useLocation() inside the BrowserRouter.
  return (
    <>
      {location.pathname !== "/login" && !isTenantRoute && (
        <ProtectedRoute>
          <Header />
        </ProtectedRoute>
      )}
      {location.pathname !== "/login" && isTenantRoute && (
        <ProtectedRoute>
          <TenantHeader />
        </ProtectedRoute>
      )}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
        <Route path="/pg-list" element={<ProtectedRoute><PGList /></ProtectedRoute>} />
        <Route path="/pg/:pgId" element={<ProtectedRoute><PGLayout /></ProtectedRoute>}>
          <Route index element={<ProtectedRoute><PGDetails /></ProtectedRoute>}></Route>
          <Route path="rooms" element={<ProtectedRoute><RoomsList /></ProtectedRoute>} />
          <Route path="roomtypes" element={<ProtectedRoute><RoomTypes /></ProtectedRoute>} />
          <Route path="tenants" element={<ProtectedRoute><TenantList /></ProtectedRoute>} />
          <Route path="dues" element={<ProtectedRoute><Dues /></ProtectedRoute>} />
        </Route>
        <Route
          path="/t"
          element={
            <ProtectedRoute allowedRoles={["TENANT"]}>
              <TenantLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<TenantDashboard />} />
          <Route path="room" element={<TenantRoom />} />
          <Route path="dues" element={<TenantDues />} />
          <Route path="maintenance" element={<TenantMaintainence />} />
        </Route>
      </Routes>

    </>
  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default AppWrapper;
