// File: auth.js
import {
  storage,
  showError,
  hideError,
  showLoading,
  hideLoading,
  isValidEmail,
} from "./utils.js";

// Auth token and user management
export function isLoggedIn() {
  return !!(storage.get("authToken") && storage.get("currentUser"));
}

export function getCurrentUser() {
  return storage.get("currentUser");
}

export function setAuth(token, user) {
  storage.set("authToken", token);
  storage.set("currentUser", user);
}

export function clearAuth() {
  storage.remove("authToken");
  storage.remove("currentUser");
}

export function initLogin() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!email || !password) return showError("Please fill in all fields");
    if (!isValidEmail(email)) return showError("Invalid email address");

    try {
      showLoading(submitBtn, "Signing in...");
      hideError();

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");

      setAuth(data.token || "mock-token", data.user || { email });
      window.location.href = "dashboard.html";
    } catch (err) {
      showError(err.message);
    } finally {
      hideLoading(submitBtn, "Login");
    }
  });
}

export function initRegister() {
  const form = document.getElementById("register-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !password || !confirmPassword) return showError("Please fill in all fields");
    if (!isValidEmail(email)) return showError("Invalid email address");
    if (password.length < 8) return showError("Password must be at least 8 characters");
    if (password !== confirmPassword) return showError("Passwords do not match");

    try {
      showLoading(submitBtn, "Creating account...");
      hideError();

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");

      alert("Account created successfully! Please log in.");
      window.location.href = "index.html";
    } catch (err) {
      showError(err.message);
    } finally {
      hideLoading(submitBtn, "Register");
    }
  });
}

export async function logout() {
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include", 
      headers: {
        Authorization: `Bearer ${storage.get("authToken")}`,
      },
    });
  } catch (err) {
    console.error("Logout error:", err);
  } finally {
    clearAuth();
    window.location.href = "index.html";
  }
}