import { refreshAccessToken } from "./auth.js";
export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("access_token");

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

        const newAccessToken = refreshAccessToken();
        localStorage.setItem("access_token", newAccessToken.access_token);
        response = fetch(url, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${newAccessToken.access}`,
                ...options.headers
            }
        });
    }
    return response;
};