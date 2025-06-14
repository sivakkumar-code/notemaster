// api.js

const API_BASE_URL = "/api"

// Auth headers
function getAuthHeaders() {
  // const token = getStorage("authToken")
  return {
    "Content-Type": "application/json",
    // Authorization: token ? `Bearer ${token}` : "",
  }
}

async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  const config = {
    headers: getAuthHeaders(),
    credentials: "include", // <- This is critical for cookie-based auth
    ...options,
  }

  try {
    const response = await fetch(url, config)

    if (response.status === 401) {
      window.location.href = "index.html"
      return
    }

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}


// Core API request handler
// async function apiRequest(endpoint, options = {}) {
//   const url = `${API_BASE_URL}${endpoint}`
//   const config = {
//     headers: getAuthHeaders(),
//     ...options,
//   }

//   try {
//     const response = await fetch(url, config)

//     if (response.status === 401) {
//       clearAuth()
//       window.location.href = "index.html"
//       return
//     }

//     const data = await response.json()

//     if (!response.ok) {
//       throw new Error(data.message || `HTTP error! status: ${response.status}`)
//     }

//     return data
//   } catch (error) {
//     console.error("API request failed:", error)
//     throw error
//   }
// }

// Notes API
export async function getAllNotes(filters = {}) {
  const params = new URLSearchParams(filters)
  return apiRequest(`/notes?${params}`)
}

export async function getNoteById(id) {
  return apiRequest(`/notes/${id}`)
}

export async function createNote(noteData) {
  return apiRequest("/notes", {
    method: "POST",
    body: JSON.stringify(noteData),
  })
}

export async function updateNote(id, noteData) {
  return apiRequest(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(noteData),
  })
}

export async function deleteNote(id) {
  return apiRequest(`/notes/${id}`, {
    method: "DELETE",
  })
}

export async function permanentDeleteNote(id) {
  return apiRequest(`/notes/${id}/permanent`, {
    method: "DELETE",
  })
}

export async function restoreNote(id) {
  return apiRequest(`/notes/${id}/restore`, {
    method: "POST",
  })
}

export async function toggleArchiveNote(id) {
  return apiRequest(`/notes/${id}/archive`, {
    method: "POST",
  })
}

export async function searchNotes(query) {
  return apiRequest(`/notes/search?q=${encodeURIComponent(query)}`)
}

// Tags API
export async function getAllTags() {
  return apiRequest("/tags")
}

export async function createTag(tagData) {
  return apiRequest("/tags", {
    method: "POST",
    body: JSON.stringify(tagData),
  })
}

export async function updateTag(id, tagData) {
  return apiRequest(`/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify(tagData),
  })
}

export async function deleteTag(id) {
  return apiRequest(`/tags/${id}`, {
    method: "DELETE",
  })
}

// User API
export async function getUserProfile() {
  return apiRequest("/user/profile")
}

export async function updateUserProfile(userData) {
  return apiRequest("/user/profile", {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}