// =============================================
// js/api.js — API Client & Auth Utilities
// =============================================

// Set your deployed backend URL here (no trailing slash)
// For local development: http://localhost:5000
const API_BASE = window.ENV_API_URL || "http://localhost:5000";

// ---- Token Management ----
const auth = {
  getToken: () => localStorage.getItem("tm_token"),
  setToken: (token) => localStorage.setItem("tm_token", token),
  getUser: () => {
    try {
      return JSON.parse(localStorage.getItem("tm_user") || "null");
    } catch {
      return null;
    }
  },
  setUser: (user) => localStorage.setItem("tm_user", JSON.stringify(user)),
  clear: () => {
    localStorage.removeItem("tm_token");
    localStorage.removeItem("tm_user");
  },
  isLoggedIn: () => !!localStorage.getItem("tm_token"),
};

// ---- API Request Helper ----
async function apiRequest(endpoint, options = {}) {
  const token = auth.getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // If 401, clear auth and redirect to login
    if (response.status === 401) {
      auth.clear();
      window.location.href = "login.html";
    }
    throw new Error(data.message || "Something went wrong.");
  }

  return data;
}

// ---- Route Guard ----
// Call on protected pages — redirects to login if not authenticated
function requireAuth() {
  if (!auth.isLoggedIn()) {
    window.location.href = "/login.html";
  }
}

// Call on auth pages — redirects to dashboard if already logged in
function redirectIfLoggedIn() {
  if (auth.isLoggedIn()) {
    window.location.href = "dashboard.html";
  }
}
