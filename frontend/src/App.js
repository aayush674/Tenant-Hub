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

import { ProtectedRoute } from "./api/protectedRoute";

function App() {
  return (
    
    <div className="page-box">
      
        
    </div>

  );
}

function Layout() {
  const location = useLocation();
  // useLocation(), useNavigate() and useParams() must be used within router components else these wouldn't be identified if initialized before browser router. So we created this Layout component to render useLocation() inside the BrowserRouter.
  return (
    <>
      {location.pathname !== "/login" && (<ProtectedRoute><Header /></ProtectedRoute>)}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><App /></ProtectedRoute>} />
        <Route path="/pg-list" element={<ProtectedRoute><PGList /></ProtectedRoute>} />
        <Route path="/pg/:pgId" element={<ProtectedRoute><PGLayout /></ProtectedRoute>}>
            <Route index element={<ProtectedRoute><PGDetails /></ProtectedRoute>}></Route>
            <Route path="rooms" element={<ProtectedRoute><RoomsList /></ProtectedRoute>} />
            <Route path="roomtypes" element={<ProtectedRoute><RoomTypes /></ProtectedRoute>} />
            <Route path="tenants" element={<ProtectedRoute><TenantList /></ProtectedRoute>} />
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
