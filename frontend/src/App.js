import React,{useState} from "react";
import "./App.css";
import AddPG from "./components/addPG";
import Header from "./components/header";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import PGList from "./components/pgList";

function App() {
  const [showAddPG, setShowAddPG] = useState(false);
  const navigate = useNavigate();

  return (
    
    <div className="page-box">
      <button onClick={() => setShowAddPG(true)} className="create-pg-btn">
        <strong>+ Create PG</strong>
      </button>

      <AddPG 
      show={showAddPG} 
      onClose={() => setShowAddPG(false)} 
      onAdd={() => {
        setShowAddPG(false);
        navigate("/pg-list", { state: { pgAdded: true } });
        }} />
      
        
    </div>

  );
}

function AppWrapper() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/pg-list" element={<PGList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppWrapper;
