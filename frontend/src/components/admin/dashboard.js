import "../../styles/dashboard.css";
import { FiBarChart2 } from "react-icons/fi";

function Dashboard(){
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
        </div>
        <div className="dashboard-body">
          <div className="coming-soon-block">
            <div className="coming-soon-icon">
              <FiBarChart2 />
            </div>
            <p>Dashboard currently under development.</p>
            <p>Coming Soon...</p>
          </div>
        </div>
      </div>
    );
}

export default Dashboard;
