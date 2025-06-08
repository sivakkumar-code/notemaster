// Main dashboard controller functions for NoteMaster

// dashboard.js

// Exported so other modules can import if needed
import { logout } from "./auth.js";
import { debounce } from "./utils.js";
import { initTags } from "./tags.js";
import { initNotes, setNotesView, searchNotes } from "./notes.js";
export let currentDashboardView = "notes";

// Initialize dashboard
export function initDashboard() {
  bindDashboardEvents();
  initializeAllManagers();
  setActiveView("notes");
}

// Initialize all sub-managers
function initializeAllManagers() {
  initNotes();
  initTags();
}

// Bind event listeners for dashboard
function bindDashboardEvents() {
  bindNavigationEvents();
  bindSearchEvents();
  bindLogoutEvent();
}

// Bind navigation events
function bindNavigationEvents() {
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    const button = item.querySelector("button");
    if (button) {
      button.addEventListener("click", () => {
        const view = item.dataset.view;
        setActiveView(view);
      });
    }
  });
}

// Bind search events
function bindSearchEvents() {
  const searchForm = document.getElementById("search-form");
  const searchInput = document.getElementById("search-input");

  if (searchForm && searchInput) {
    // Debounced search
    const debouncedSearch = debounce((query) => {
      searchNotes(query);
    }, 300);

    searchInput.addEventListener("input", (e) => {
      console.log("without debounce", e.target.value);
      debouncedSearch(e.target.value.trim());
    });

    searchForm.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("submit");
      searchNotes(searchInput.value.trim());
    });
  }
}

// Bind logout event
function bindLogoutEvent() {
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to logout?")) {
        logout();
      }
    });
  }
}

// Set active view
export function setActiveView(view) {
  currentDashboardView = view;

  // Update navigation active state
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.view === view);
  });

  // Clear tag selection
  document.querySelectorAll(".sidebar-tags li").forEach((item) => {
    item.classList.remove("active");
  });

  // Update notes view
  setNotesView(view);
}

// Show loading state
export function showDashboardLoading() {
  const notesGrid = document.getElementById("notes-grid");
  const emptyState = document.getElementById("empty-state");

  if (notesGrid) notesGrid.style.display = "none";
  if (emptyState) {
    emptyState.style.display = "flex";
    emptyState.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i><p>Loading...</p>';
  }
}

// Hide loading state
export function hideDashboardLoading() {
  const emptyState = document.getElementById("empty-state");
  if (emptyState) {
    emptyState.innerHTML =
      '<i class="fas fa-sticky-note"></i><p>No notes found</p>';
  }
}
