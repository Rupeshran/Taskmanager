// =============================================
// js/auth.js — Login & Register Logic
// =============================================

// ---- Shared Utilities ----
function showAlert(id, message, type = "error") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert--${type} show`;
  el.style.display = "flex";
  setTimeout(() => {
    el.className = `alert alert--${type}`;
    el.style.display = "";
  }, 5000);
}

function setLoading(btnId, spinnerId, loading) {
  const btn = document.getElementById(btnId);
  const spinner = document.getElementById(spinnerId);
  if (btn) btn.disabled = loading;
  if (spinner) spinner.className = loading ? "spinner show" : "spinner";
}

// ---- Login ----
async function handleLogin(event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  if (!email || !password) {
    showAlert("loginAlert", "Please fill in all fields.");
    return;
  }

  setLoading("loginBtn", "loginSpinner", true);

  try {
    const data = await apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    auth.setToken(data.token);
    auth.setUser(data.user);
    window.location.href = "dashboard.html";
  } catch (err) {
    showAlert("loginAlert", err.message);
  } finally {
    setLoading("loginBtn", "loginSpinner", false);
  }
}

// ---- Register ----
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;

  if (!name || !email || !password || !confirmPassword) {
    showAlert("registerAlert", "Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    showAlert("registerAlert", "Passwords do not match.");
    return;
  }

  setLoading("registerBtn", "registerSpinner", true);

  try {
    const data = await apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });

    auth.setToken(data.token);
    auth.setUser(data.user);
    window.location.href = "/dashboard.html";
  } catch (err) {
    showAlert("registerAlert", err.message);
  } finally {
    setLoading("registerBtn", "registerSpinner", false);
  }
}

// ---- Logout ----
function logout() {
  auth.clear();
  window.location.href = "/login.html";
}

// Attach event listeners if elements exist on this page
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);
});
