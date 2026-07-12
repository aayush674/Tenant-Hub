// import { authFetch } from "./apiClient";
import { API_BASE_URL } from "../config";

export async function signup(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
        throw new Error('Signup failed');
    }
    return response.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return res.json();
}

export const refreshAccessToken = async () => {

    const refresh = localStorage.getItem("refresh");

    const response = await fetch(`${API_BASE_URL}/api/token/refresh/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            refresh: refresh
        })
    });

    const data = await response.json();

    return data;
};
