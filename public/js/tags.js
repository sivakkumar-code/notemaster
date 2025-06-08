// tags.js as ES module

import { setNotesView, loadNotes } from "./notes.js";
import { getAllTags, createTag, updateTag, deleteTag } from "./api.js";

const TAG_COLORS = [
  "#4285f4",
  "#34a853",
  "#fbbc04",
  "#ea4335",
  "#9c27b0",
  "#ff9800",
  "#795548",
  "#607d8b",
  "#e91e63",
  "#009688",
];

let tags = [];

let editingTagId = null; // null = create, otherwise = edit mode

// Initialize tags functionality
export async function initTags() {
  await loadTags();
  bindTagsEvents();
}

// Bind event listeners for tags
function bindTagsEvents() {
  const addLabelBtn = document.getElementById("add-label-btn");
  if (addLabelBtn) {
    addLabelBtn.addEventListener("click", () => {
      console.log("add-btn-label clicked");
      showCreateTagModal();
    });
  }
  bindTagModalEvents();
}

// Bind modal events
function bindTagModalEvents() {
  const modal = document.getElementById("tag-modal-overlay");
  const closeBtn = document.getElementById("close-tag-modal");
  const cancelBtn = document.getElementById("cancel-tag-btn");
  const createBtn = document.getElementById("create-tag-btn");

  // adding eventlistener to closeBtn and cancelBtn
  closeBtn.addEventListener("click", () => hideCreateTagModal());
  cancelBtn.addEventListener("click", () => hideCreateTagModal());

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) hideCreateTagModal();
    });
  }

  if (createBtn) {
    // createBtn.addEventListener("click", () => handleCreateTagFromModal());
    createBtn.addEventListener("click", handleSubmitTagModal);
  }

  initTagColorPicker();
}

// Initialize tag color picker
function initTagColorPicker() {
  const colorPicker = document.getElementById("tag-color-picker");
  if (!colorPicker) return;

  colorPicker.innerHTML = "";

  const fragment = document.createDocumentFragment();

  TAG_COLORS.forEach((color) => {
    const colorOption = createElement("button", {
      class: "tag-color-option",
      style: `background-color: ${color}`,
      "data-color": color,
      title: color,
    });

    colorOption.addEventListener("click", () => {
      colorPicker.querySelectorAll(".tag-color-option").forEach((opt) => {
        opt.classList.remove("active");
      });
      colorOption.classList.add("active");
    });

    fragment.appendChild(colorOption);
  });

  colorPicker.appendChild(fragment);

  const firstOption = colorPicker.querySelector(".tag-color-option");
  if (firstOption) {
    firstOption.classList.add("active");
  }
}

// Load tags from API
async function loadTags() {
  try {
    tags = await getAllTags();
  } catch (error) {
    console.error("Error loading tags:", error);
    tags = [
      { _id: "1", name: "personal", color: "#4285f4" },
      { _id: "2", name: "work", color: "#34a853" },
      { _id: "3", name: "ideas", color: "#fbbc04" },
    ];
  }
  renderTags();
}

// Render tags in sidebar
function renderTags() {
  const tagsList = document.getElementById("tags-list");
  if (!tagsList) return;

  tagsList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  tags.forEach((tag) => {
    const tagItem = createTagItem(tag);
    fragment.appendChild(tagItem);
  });
  tagsList.appendChild(fragment);
}

// Create tag item element

function createTagItem(tag) {
  const li = createElement("li", {
    "data-tag-id": tag._id,
    "data-tag-name": tag.name,
    class: "sidebar-tags",
    style:
      "display: flex; justify-content: space-between; align-items: center;",
  });

  const left = createElement("div", {
    style: "display: flex; align-items: center; gap: 6px; flex: 1;",
  });

  const button = createElement("button", {
    class: "tag-view-btn",
    // style: "all: unset; cursor: pointer;",
    innerHTML: `<i class="fas fa-tag" style="color: ${
      tag.color
    }; margin-right: 4px;"></i><span>${escapeHtml(tag.name)}</span>`,
  });

  button.addEventListener("click", () => {
    document
      .querySelectorAll(".sidebar-tags li")
      .forEach((item) => item.classList.remove("active"));
    li.classList.add("active");

    document
      .querySelectorAll(".nav-item")
      .forEach((item) => item.classList.remove("active"));

    setNotesView("tag", tag.name);
  });

  left.appendChild(button);

  const controls = createElement("div", {
    style: "display: flex; align-items: center; gap: 6px;",
  });

  // Edit button
  const editBtn = createElement("button", {
    class: "edit-tag-btn",
    innerHTML: `<i class="fas fa-edit" style="color: #666;"></i>`,
    title: "Edit tag",
    style: "background: none; border: none; cursor: pointer;",
  });

  editBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    showEditTagModal(tag); // Call the edit modal function with tag data
  });

  // Delete button
  const deleteBtn = createElement("button", {
    class: "delete-tag-btn",
    innerHTML: `<i class="fas fa-trash-alt" style="color: #888;"></i>`,
    title: "Delete tag",
    style: "background: none; border: none; cursor: pointer;",
  });

  deleteBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    handleDeleteTag(tag._id);
  });

  controls.appendChild(editBtn);
  controls.appendChild(deleteBtn);

  li.appendChild(left);
  li.appendChild(controls);

  return li;
}

function showCreateTagModal() {
  editingTagId = null;

  const modal = document.getElementById("tag-modal-overlay");
  if (!modal) return;

  const nameInput = document.getElementById("tag-name");
  if (nameInput) nameInput.value = "";

  const colorPicker = document.getElementById("tag-color-picker");
  if (colorPicker) {
    colorPicker
      .querySelectorAll(".tag-color-option")
      .forEach((opt) => opt.classList.remove("active"));

    const firstOption = colorPicker.querySelector(".tag-color-option");
    if (firstOption) firstOption.classList.add("active");
  }

  const createBtn = document.getElementById("create-tag-btn");
  if (createBtn) {
    createBtn.textContent = "Create Tag";
  }

  modal.style.display = "flex";
  if (nameInput) nameInput.focus();
}

function showEditTagModal(tag) {
  editingTagId = tag._id;

  const modal = document.getElementById("tag-modal-overlay");
  if (!modal) return;

  const nameInput = document.getElementById("tag-name");
  if (nameInput) nameInput.value = tag.name;

  const colorPicker = document.getElementById("tag-color-picker");
  if (colorPicker) {
    colorPicker.querySelectorAll(".tag-color-option").forEach((opt) => {
      opt.classList.remove("active");
      if (opt.dataset.color === tag.color) {
        opt.classList.add("active");
      }
    });
  }

  const createBtn = document.getElementById("create-tag-btn");
  if (createBtn) {
    createBtn.textContent = "Update Tag";
  }

  modal.style.display = "flex";
  if (nameInput) nameInput.focus();
}

// Reuse this for both create and update
async function handleSubmitTagModal() {
  const nameInput = document.getElementById("tag-name");
  const colorPicker = document.getElementById("tag-color-picker");

  if (!nameInput || !colorPicker) return;

  const name = nameInput.value.trim();
  const selectedColor = colorPicker.querySelector(".tag-color-option.active");
  const color = selectedColor ? selectedColor.dataset.color : TAG_COLORS[0];

  if (!name) {
    showTagError("Tag name is required");
    return;
  }

  if (editingTagId) {
    try {
      await handleUpdateTag(editingTagId, { name, color });
      hideCreateTagModal();
    } catch (error) {
      showTagError("Failed to update tag");
    }
  } else {
    if (getTagByName(name)) {
      showTagError("Tag already exists");
      return;
    }

    try {
      const newTag = await handleCreateTag(name, color);
      if (newTag) hideCreateTagModal();
    } catch (error) {
      showTagError("Failed to create tag");
    }
  }
}

// Hide create tag modal
function hideCreateTagModal() {
  editingTagId = null;
  const modal = document.getElementById("tag-modal-overlay");
  if (modal) modal.style.display = "none";
}

// Handle create tag from modal
async function handleCreateTagFromModal() {
  const nameInput = document.getElementById("tag-name");
  const colorPicker = document.getElementById("tag-color-picker");

  if (!nameInput || !colorPicker) return;

  const name = nameInput.value.trim();
  const selectedColor = colorPicker.querySelector(".tag-color-option.active");
  const color = selectedColor ? selectedColor.dataset.color : TAG_COLORS[0];

  if (!name) {
    showTagError("Tag name is required");
    return;
  }

  if (getTagByName(name)) {
    showTagError("Tag already exists");
    return;
  }

  try {
    const newTag = await handleCreateTag(name, color);
    if (newTag) hideCreateTagModal();
  } catch (error) {
    console.error("Error creating tag:", error);
    showTagError("Failed to create tag");
  }
}

// Create new tag
async function handleCreateTag(name, color = TAG_COLORS[0]) {
  try {
    const tagData = { name, color };
    const newTag = await createTag(tagData);

    tags.push(newTag);
    renderTags();

    return newTag;
  } catch (error) {
    console.error("Error creating tag:", error);

    const mockTag = {
      _id: generateId(),
      name,
      color,
      userId: "current-user",
    };

    tags.push(mockTag);
    renderTags();

    return mockTag;
  }
}

function getTagByName(name) {
  return tags.find((tag) => tag.name.toLowerCase() === name.toLowerCase());
}

function getTagById(id) {
  return tags.find((tag) => tag._id === id);
}

function getAllTagsData() {
  return tags;
}

// Update tag
async function handleUpdateTag(id, tagData) {
  try {
    const updatedTagValue = await updateTag(id, tagData);
    const index = tags.findIndex((tag) => tag._id === id);
    if (index !== -1) {
      tags[index] = updatedTagValue;
      renderTags();
    }
    loadNotes();
    return updatedTagValue;
  } catch (error) {
    console.error("Error updating tag:", error);
    throw error;
  }
}

// Delete tag
async function handleDeleteTag(id) {
  if (!confirm("Delete this tag? It will be removed from all notes.")) return;

  try {
    await deleteTag(id);
    tags = tags.filter((tag) => tag._id !== id);
    renderTags();
    loadNotes();
  } catch (error) {
    console.error("Error deleting tag:", error);
    showTagError("Failed to delete tag");
  }
}

// Show tag error
function showTagError(message) {
  alert(message);
}

// Helpers

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

export function createElement(type, options = {}) {
  const element = document.createElement(type);

  Object.entries(options).forEach(([key, value]) => {
    if (key === "style") {
      // Use element.style.cssText for string or iterate if it's an object
      if (typeof value === "string") {
        element.style.cssText = value;
      } else if (typeof value === "object") {
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      }
    } else if (key === "innerHTML") {
      element.innerHTML = value;
    } else if (key === "class") {
      element.className = value;
    } else {
      element.setAttribute(key, value);
    }
  });

  return element;
}

// Export any other functions you want to expose
export {
  handleCreateTag,
  handleUpdateTag,
  handleDeleteTag,
  getTagByName,
  getTagById,
  getAllTagsData,
  showCreateTagModal,
  hideCreateTagModal,
};