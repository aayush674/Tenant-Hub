const API_BASE = "http://127.0.0.1:8000/auth";

export async function signup(email, password) {
    const response = await fetch(`${API_BASE}/signup/`, {
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
  const res = await fetch(`${API_BASE}/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });

  return res.json();
}