import {Navigate} from "react-router-dom";

export const ProtectedRoute = ({children}) =>{

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        return <Navigate to="/login" />;
    }
    return children;
}