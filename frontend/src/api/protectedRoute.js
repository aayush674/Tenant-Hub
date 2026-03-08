import {Navigate} from "react-router-dom";

export const ProtectedRoute = ({page}) =>{

    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
        return <Navigate to="/login" />;
    }
    return page;
}