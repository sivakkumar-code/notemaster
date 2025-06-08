// File: utils.js

// Format date for display
// export function formatDate(date) {
//   if (!date) return "";

//   const now = new Date();
//   const noteDate = new Date(date);
//   const diffTime = Math.abs(now - noteDate);
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

//   if (diffDays === 1) {
//     return "Yesterday";
//   } else if (diffDays <= 7) {
//     return `${diffDays} days ago`;
//   } else {
//     return noteDate.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       year: noteDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
//     });
//   }
// }

// Format reminder date
// export function formatReminderDate(date) {
//   if (!date) return "";

//   const reminderDate = new Date(date);
//   const now = new Date();

//   if (reminderDate.toDateString() === now.toDateString()) {
//     return `Today ${reminderDate.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//     })}`;
//   } else if (reminderDate.toDateString() === new Date(now.getTime() + 86400000).toDateString()) {
//     return `Tomorrow ${reminderDate.toLocaleTimeString("en-US", {
//       hour: "numeric",
//       minute: "2-digit",
//     })}`;
//   } else {
//     return reminderDate.toLocaleDateString("en-US", {
//       month: "short",
//       day: "numeric",
//       hour: "numeric",
//       minute: "2-digit",
//     });
//   }
// }

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

// export function escapeHtml(text) {
//   const div = document.createElement("div");
//   div.textContent = text;
//   return div.innerHTML;
// }

// export function createElement(tag, attributes = {}, children = []) {
//   const element = document.createElement(tag);
//   Object.keys(attributes).forEach((key) => {
//     if (key === "className") {
//       element.className = attributes[key];
//     } else if (key === "innerHTML") {
//       element.innerHTML = attributes[key];
//     } else {
//       element.setAttribute(key, attributes[key]);
//     }
//   });
//   children.forEach((child) => {
//     element.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
//   });
//   return element;
// }

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

// export function clearElement(element) {
//   while (element.firstChild) {
//     element.removeChild(element.firstChild);
//   }
// }

// Animations
// export function fadeIn(element, duration = 300) {
//   element.style.opacity = 0;
//   element.style.display = "block";
//   let start;
//   function animate(timestamp) {
//     if (!start) start = timestamp;
//     const progress = timestamp - start;
//     element.style.opacity = Math.min(progress / duration, 1);
//     if (progress < duration) requestAnimationFrame(animate);
//   }
//   requestAnimationFrame(animate);
// }

// export function fadeOut(element, duration = 300) {
//   let start;
//   function animate(timestamp) {
//     if (!start) start = timestamp;
//     const progress = timestamp - start;
//     element.style.opacity = Math.max(1 - progress / duration, 0);
//     if (progress < duration) {
//       requestAnimationFrame(animate);
//     } else {
//       element.style.display = "none";
//     }
//   }
//   requestAnimationFrame(animate);
// }