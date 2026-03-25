import "./App.css";
import Header from "./components/header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PGList from "./components/pgList";
import Login from "./components/login";
import RoomsList from "./components/roomsList";
import RoomTypes from "./components/roomTypes";

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
        <Route path="/pg/:pgId/rooms" element={<ProtectedRoute><RoomsList /></ProtectedRoute>} />
        <Route path="/pg/:pgId/roomtypes" element={<ProtectedRoute><RoomTypes /></ProtectedRoute>} />
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
