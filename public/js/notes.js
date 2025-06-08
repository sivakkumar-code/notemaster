// notes.js
import { createElement, getTagByName, getAllTagsData, handleCreateTag } from "./tags.js";
import {
  getAllNotes,
  createNote,
  updateNote,
  deleteNote,
  permanentDeleteNote,
  restoreNote,
  toggleArchiveNote,
} from "./api.js";

// Note colors constant exported for possible external use
export const NOTE_COLORS = [
  "#ffffff",
  "#f28b82",
  "#fbbc04",
  "#fff475",
  "#ccff90",
  "#a7ffeb",
  "#cbf0f8",
  "#aecbfa",
  "#d7aefb",
  "#fdcfe8",
];

// Module scoped state (not global variables)
let notes = [];
let currentNote = null;
let currentView = "notes";
let searchQuery = "";
let selectedTag = null;

// Initialize notes functionality - exported to be called externally
export function initNotes() {
  bindNotesEvents();
  loadNotes();
}

function bindNotesEvents() {
  const createBtn = document.getElementById("create-note-btn");
  if (createBtn) {
    createBtn.addEventListener("click", () => openNoteEditor());
  }
  bindNoteEditorEvents();
}

function bindNoteEditorEvents() {
  const overlay = document.getElementById("note-editor-overlay");
  const saveBtn = document.getElementById("save-note-btn");
  const cancelBtn = document.getElementById("cancel-note-btn");
  const reminderInput = document.getElementById("note-reminder");
  const clearReminderBtn = document.getElementById("clear-reminder-btn");

  if (overlay) {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeNoteEditor();
    });
  }

  if (saveBtn) saveBtn.addEventListener("click", () => saveNote());
  if (cancelBtn) cancelBtn.addEventListener("click", () => closeNoteEditor());

  if (reminderInput) {
    reminderInput.addEventListener("change", () => {
      if (clearReminderBtn) {
        clearReminderBtn.style.display = reminderInput.value ? "block" : "none";
      }
    });
  }

  if (clearReminderBtn) {
    clearReminderBtn.addEventListener("click", () => {
      reminderInput.value = "";
      clearReminderBtn.style.display = "none";
    });
  }

  initNoteColorPicker();

  // Escape key to close editor
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (overlay && overlay.style.display !== "none") {
        closeNoteEditor();
      }
    }
  });
}

function initNoteColorPicker() {
  const colorPicker = document.getElementById("color-picker");
  if (!colorPicker) return;

  colorPicker.innerHTML = "";

  const fragment = document.createDocumentFragment();
  NOTE_COLORS.forEach((color) => {
    const colorOption = createElement("button", {
      class: "color-option",
      style: `background-color: ${color}`,
      "data-color": color,
      title: color === "#ffffff" ? "Default" : color,
    });

    colorOption.addEventListener("click", () => {
      colorPicker.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("active");
      });
      colorOption.classList.add("active");
      const editor = document.querySelector(".note-editor");
      if (editor) editor.style.backgroundColor = color;
    });

    fragment.appendChild(colorOption);
  });
  colorPicker.appendChild(fragment);
}

export async function loadNotes() {
  try {
    const filters = { view: currentView, search: searchQuery };
    if (selectedTag) filters.tag = selectedTag;

    notes = await getAllNotes(filters);
    renderNotes();
  } catch (error) {
    console.error("Error loading notes:", error);
    showError("Failed to load notes");
  }
}

function renderNotes() {
  const notesGrid = document.getElementById("notes-grid");
  const emptyState = document.getElementById("empty-state");
  if (!notesGrid) return;

  if (notes.length === 0) {
    notesGrid.style.display = "none";
    if (emptyState) emptyState.style.display = "flex";
    return;
  }

  if (emptyState) emptyState.style.display = "none";
  notesGrid.style.display = "grid";
  notesGrid.innerHTML = "";

  notes.forEach((note) => {
    const noteCard = createNoteCard(note);
    notesGrid.appendChild(noteCard);
  });
}

function createNoteCard(note) {
  const card = createElement("div", {
    class: "note-card",
    style: `background-color: ${note.color}`,
    "data-note-id": note._id,
  });

  const fragment = document.createDocumentFragment();

  if (note.title) {
    const title = createElement("h3", {
      class: "note-title",
      innerHTML: escapeHtml(note.title),
    });
    fragment.appendChild(title);
  }

  const content = createElement("div", {
    class: "note-content",
    innerHTML: escapeHtml(note.content),
  });
  fragment.appendChild(content);

  if (note.reminderDate) {
    const reminder = createElement("div", {
      class: "note-reminder",
      innerHTML: `<i class="fas fa-bell"></i><span>${formatReminderDate(
        note.reminderDate
      )}</span>`,
    });
    fragment.appendChild(reminder);
  }

  console.log(note)

  if (note.tags && note.tags.length > 0) {
    const tagsContainer = createElement("div", { class: "note-tags" });

    note.tags.slice(0, 3).forEach((tagName) => {
      const tag = getTagByName(tagName);
      const tagElement = createElement("span", {
        class: "note-tag",
        style: `background-color: ${tag ? tag.color : "#4285f4"}`,
        innerHTML: escapeHtml(tagName),
      });
      tagsContainer.appendChild(tagElement);
    });

    if (note.tags.length > 3) {
      const moreTag = createElement("span", {
        class: "note-tag-more",
        innerHTML: `+${note.tags.length - 3}`,
      });
      tagsContainer.appendChild(moreTag);
    }

    fragment.appendChild(tagsContainer);
  }

  const actions = createNoteActions(note);
  fragment.appendChild(actions);

  card.appendChild(fragment);

  card.addEventListener("click", (e) => {
    if (!e.target.closest(".note-actions")) {
      openNoteEditor(note);
    }
  });

  return card;
}

function createNoteActions(note) {
  const actions = createElement("div", { class: "note-actions" });

  if (currentView === "trash") {
    const restoreBtn = createElement("button", {
      title: "Restore",
      innerHTML: '<i class="fas fa-trash-restore"></i>',
    });
    restoreBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleRestoreNote(note._id);
    });
    actions.appendChild(restoreBtn);

    const deleteBtn = createElement("button", {
      class: "delete-btn",
      title: "Delete permanently",
      innerHTML: '<i class="fas fa-trash-alt"></i>',
    });
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handlePermanentDeleteNote(note._id);
    });
    actions.appendChild(deleteBtn);
  } else {
    const archiveBtn = createElement("button", {
      title: note.isArchived ? "Unarchive" : "Archive",
      innerHTML: `<i class="fas ${
        note.isArchived ? "fa-inbox" : "fa-archive"
      }"></i>`,
    });
    archiveBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleToggleArchiveNote(note._id);
    });
    actions.appendChild(archiveBtn);

    const deleteBtn = createElement("button", {
      title: "Delete",
      innerHTML: '<i class="fas fa-trash"></i>',
    });
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      handleDeleteNote(note._id);
    });
    actions.appendChild(deleteBtn);
  }

  return actions;
}

export function openNoteEditor(note = null) {
  currentNote = note;
  const overlay = document.getElementById("note-editor-overlay");
  const editor = document.querySelector(".note-editor");
  if (!overlay || !editor) return;

  document.getElementById("note-title").value = note ? note.title : "";
  document.getElementById("note-content").value = note ? note.content : "";
  document.getElementById("note-reminder").value =
    note && note.reminderDate
      ? new Date(note.reminderDate).toISOString().slice(0, 16)
      : "";

  const color = note ? note.color : "#ffffff";
  editor.style.backgroundColor = color;

  const colorPicker = document.getElementById("color-picker");
  if (colorPicker) {
    colorPicker.querySelectorAll(".color-option").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.color === color);
    });
  }

  const clearReminderBtn = document.getElementById("clear-reminder-btn");
  if (clearReminderBtn) {
    clearReminderBtn.style.display = document.getElementById("note-reminder")
      .value
      ? "block"
      : "none";
  }

  loadNoteTags(note ? note.tags : []);

  overlay.style.display = "flex";
  document.getElementById("note-title").focus();
}

export function closeNoteEditor() {
  const overlay = document.getElementById("note-editor-overlay");
  if (overlay) overlay.style.display = "none";
  currentNote = null;
}

function loadNoteTags(selectedTags = []) {
  const container = document.getElementById("note-tags-container");
  if (!container) return;

  container.innerHTML = "";

  const fragment = document.createDocumentFragment();

  selectedTags.forEach((tagName) => {
    const tag = getTagByName(tagName);
    const tagElement = createSelectedTag(tagName, tag ? tag.color : "#4285f4");
    fragment.appendChild(tagElement);
  });

  if (selectedTags.length < 9) {
    const addBtn = createElement("button", {
      class: "btn-add-tag",
      innerHTML: '<i class="fas fa-plus"></i><span>Add Tag</span>',
    });
    addBtn.addEventListener("click", () => showTagSelector());
    fragment.appendChild(addBtn);
  }
  container.appendChild(fragment);
}

function createSelectedTag(tagName, color) {
  const tag = createElement("span", {
    class: "selected-tag",
    style: `background-color: ${color}`,
    innerHTML: `${escapeHtml(
      tagName
    )}<button><i class="fas fa-times"></i></button>`,
  });

  const removeBtn = tag.querySelector("button");
  removeBtn.addEventListener("click", () => {
    tag.remove();
    loadNoteTags(getSelectedTags());
  });

  return tag;
}

function getSelectedTags() {
  const container = document.getElementById("note-tags-container");
  if (!container) return [];

  return Array.from(container.querySelectorAll(".selected-tag")).map((tag) => {
    return tag.textContent.replace("×", "").trim();
  });
}

function showTagSelector() {
  const availableTags = getAllTagsData().filter(
    (tag) => !getSelectedTags().includes(tag.name)
  );

  if (availableTags.length === 0) {
    alert("No more tags available. Create a new tag first.");
    return;
  }

  const tagName = prompt(
    "Enter tag name or select from: " +
      availableTags.map((t) => t.name).join(", ")
  );
  if (!tagName) return;

  const existingTag = getTagByName(tagName);
  if (existingTag) {
    const container = document.getElementById("note-tags-container");
    const addBtn = container.querySelector(".btn-add-tag");
    const tagElement = createSelectedTag(tagName, existingTag.color);
    container.insertBefore(tagElement, addBtn);

    if (getSelectedTags().length >= 9) addBtn.remove();
  } else {
    handleCreateTag(tagName).then((newTag) => {
      if (newTag) {
        const container = document.getElementById("note-tags-container");
        const addBtn = container.querySelector(".btn-add-tag");
        const tagElement = createSelectedTag(tagName, newTag.color);
        container.insertBefore(tagElement, addBtn);

        if (getSelectedTags().length >= 9) addBtn.remove();
      }
    });
  }
}

async function saveNote() {
  const title = document.getElementById("note-title").value.trim();
  const content = document.getElementById("note-content").value.trim();
  const reminderDate = document.getElementById("note-reminder").value;
  const color =
    document.querySelector(".color-option.active")?.dataset.color || "#ffffff";
  const tags = getSelectedTags();

  if (!content) {
    alert("Note content is required");
    return;
  }

  const noteData = {
    title,
    content,
    color,
    tags,
    reminderDate: reminderDate ? new Date(reminderDate) : null,
  };

  try {
    if (currentNote) {
      await updateNote(currentNote._id, noteData);
    } else {
      await createNote(noteData);
    }
    closeNoteEditor();
    await loadNotes();
  } catch (error) {
    console.error("Error saving note:", error);
    alert("Failed to save note");
  }
}

async function handleDeleteNote(noteId) {
  if (!confirm("Move this note to trash?")) return;

  try {
    await deleteNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error("Error deleting note:", error);
    alert("Failed to delete note");
  }
}

async function handlePermanentDeleteNote(noteId) {
  if (!confirm("Permanently delete this note? This action cannot be undone."))
    return;

  try {
    await permanentDeleteNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error("Error permanently deleting note:", error);
    alert("Failed to permanently delete note");
  }
}

async function handleRestoreNote(noteId) {
  try {
    await restoreNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error("Error restoring note:", error);
    alert("Failed to restore note");
  }
}

async function handleToggleArchiveNote(noteId) {
  try {
    await toggleArchiveNote(noteId);
    await loadNotes();
  } catch (error) {
    console.error("Error archiving note:", error);
    alert("Failed to archive note");
  }
}

export function setNotesView(view, tag = null) {
  currentView = view;
  selectedTag = tag;
  loadNotes();

  const viewTitle = document.getElementById("view-title");
  if (viewTitle) {
    if (view === "tag" && tag) {
      viewTitle.textContent = `#${tag}`;
    } else {
      viewTitle.textContent = view.charAt(0).toUpperCase() + view.slice(1);
    }
  }

  const createBtn = document.getElementById("create-note-btn");
  if (createBtn) {
    createBtn.style.display = view === "trash" ? "none" : "flex";
  }
}

export function searchNotes(query) {
  searchQuery = query;
  loadNotes();
}

// Helpers

function showError(message) {
  // alert(message);
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatReminderDate(date) {
  return new Date(date).toLocaleString();
}