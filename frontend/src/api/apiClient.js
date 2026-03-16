import { refreshAccessToken } from "./auth.js";
export const authFetch = async (url, options = {}) => {
    let token = localStorage.getItem("access_token");

    let response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers
        }
    });

    if (response.status === 401) {
        // console.log("Access Token Expired or Invalid.");

        try {
            const newAccessToken = await refreshAccessToken();
            localStorage.setItem("access_token", newAccessToken.access_token);
            response = await fetch(url, {
                ...options,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${newAccessToken.access_token}`,
                    ...options.headers
                }
            });
        } catch(error){
            localStorage.removeItem("access_token");
            window.location.href="/login";
        }
        
    }
    return response;
};