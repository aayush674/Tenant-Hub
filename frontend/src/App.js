import "./App.css";
import Header from "./components/header";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import PGList from "./components/pgList";
import Login from "./components/login";

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
      {location.pathname !== "/login" && <Header />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<App />} />
        <Route path="/pg-list" element={<PGList />} />
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
