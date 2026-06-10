import "./App.css";
import Header from "./components/header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PGList from "./components/pgList";
import Login from "./components/login";
import RoomsList from "./components/roomsList";
import RoomTypes from "./components/roomTypes";
import TenantList from "./components/tenantList";
import PGDetails from "./components/pgDetails";
import PGLayout from "./components/pgLayout";

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
