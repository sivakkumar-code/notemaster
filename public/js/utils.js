// File: utils.js

export function truncateText(text, maxLength = 200) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export function showLoading(element, text = "Loading...") {
  const spinner = element.querySelector(".spinner");
  const btnText = element.querySelector(".btn-text");
  if (spinner && btnText) {
    spinner.style.display = "block";
    btnText.textContent = text;
    element.disabled = true;
  }
}

export function hideLoading(element, originalText = "Submit") {
  const spinner = element.querySelector(".spinner");
  const btnText = element.querySelector(".btn-text");
  if (spinner && btnText) {
    spinner.style.display = "none";
    btnText.textContent = originalText;
    element.disabled = false;
  }
}

export function showError(message, containerId = "error-message") {
  const errorElement = document.getElementById(containerId);
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
    setTimeout(() => {
      errorElement.style.display = "none";
    }, 5000);
  }
}

export function hideError(containerId = "error-message") {
  const errorElement = document.getElementById(containerId);
  if (errorElement) {
    errorElement.style.display = "none";
  }
}

export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// LocalStorage helpers
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.error("Storage set error:", err);
      return false;
    }
  },
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (err) {
      console.error("Storage get error:", err);
      return defaultValue;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.error("Storage remove error:", err);
      return false;
    }
  },
  clear() {
    try {
      localStorage.clear();
      return true;
    } catch (err) {
      console.error("Storage clear error:", err);
      return false;
    }
  },
};