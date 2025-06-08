"use client"

import { useState, useEffect } from "react"
import Sidebar from "@/components/sidebar"
import NoteList from "@/components/note-list"
import NoteEditor from "@/components/note-editor"
import type { Note, Tag } from "@/lib/types"

export default function Dashboard() {
  const [notes, setNotes] = useState<Note[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [activeView, setActiveView] = useState("notes")
  const [activeNote, setActiveNote] = useState<Note | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    // In a real app, fetch notes and tags from API
    fetchNotes()
    fetchTags()
  }, [activeView])

  const fetchNotes = async () => {
    try {
      // In a real app, this would be an actual API call
      // For demo, we'll use mock data
      const mockNotes: Note[] = [
        {
          _id: "1",
          title: "Welcome to NoteMaster",
          content: "This is your first note. Try adding more!",
          tags: ["welcome"],
          color: "#ffffff",
          isArchived: false,
          isDeleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          _id: "2",
          title: "Shopping List",
          content: "- Milk\n- Eggs\n- Bread\n- Butter",
          tags: ["shopping", "groceries"],
          color: "#f8ffa5",
          isArchived: false,
          isDeleted: false,
          reminderDate: new Date(Date.now() + 86400000), // Tomorrow
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Filter notes based on active view
      let filteredNotes = mockNotes
      if (activeView === "archived") {
        filteredNotes = mockNotes.filter((note) => note.isArchived)
      } else if (activeView === "trash") {
        filteredNotes = mockNotes.filter((note) => note.isDeleted)
      } else if (activeView === "reminders") {
        filteredNotes = mockNotes.filter((note) => note.reminderDate)
      } else if (activeView === "tag" && selectedTag) {
        filteredNotes = mockNotes.filter((note) => note.tags.includes(selectedTag))
      } else {
        filteredNotes = mockNotes.filter((note) => !note.isArchived && !note.isDeleted)
      }

      // Apply search filter if query exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredNotes = filteredNotes.filter(
          (note) => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query),
        )
      }

      setNotes(filteredNotes)
    } catch (error) {
      console.error("Error fetching notes:", error)
    }
  }

  const fetchTags = async () => {
    try {
      // In a real app, this would be an actual API call
      // For demo, we'll use mock data
      const mockTags: Tag[] = [
        { _id: "1", name: "welcome", color: "#4285f4", userId: "user1" },
        { _id: "2", name: "shopping", color: "#0f9d58", userId: "user1" },
        { _id: "3", name: "groceries", color: "#f4b400", userId: "user1" },
      ]
      setTags(mockTags)
    } catch (error) {
      console.error("Error fetching tags:", error)
    }
  }

  const handleCreateNote = async (note: Partial<Note>) => {
    try {
      // In a real app, this would be an actual API call
      const newNote: Note = {
        _id: Date.now().toString(),
        title: note.title || "",
        content: note.content || "",
        tags: note.tags || [],
        color: note.color || "#ffffff",
        isArchived: false,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      setNotes([newNote, ...notes])
      setActiveNote(null)
    } catch (error) {
      console.error("Error creating note:", error)
    }
  }

  const handleUpdateNote = async (updatedNote: Note) => {
    try {
      // In a real app, this would be an actual API call
      const updatedNotes = notes.map((note) =>
        note._id === updatedNote._id ? { ...updatedNote, updatedAt: new Date() } : note,
      )
      setNotes(updatedNotes)
      setActiveNote(null)
    } catch (error) {
      console.error("Error updating note:", error)
    }
  }

  const handleArchiveNote = async (noteId: string) => {
    try {
      // In a real app, this would be an actual API call
      const updatedNotes = notes.map((note) =>
        note._id === noteId ? { ...note, isArchived: !note.isArchived, updatedAt: new Date() } : note,
      )
      setNotes(updatedNotes)
    } catch (error) {
      console.error("Error archiving note:", error)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      // In a real app, this would be an actual API call
      const updatedNotes = notes.map((note) =>
        note._id === noteId ? { ...note, isDeleted: true, deletedAt: new Date(), updatedAt: new Date() } : note,
      )
      setNotes(updatedNotes)
    } catch (error) {
      console.error("Error deleting note:", error)
    }
  }

  const handleRestoreNote = async (noteId: string) => {
    try {
      // In a real app, this would be an actual API call
      const updatedNotes = notes.map((note) =>
        note._id === noteId ? { ...note, isDeleted: false, deletedAt: undefined, updatedAt: new Date() } : note,
      )
      setNotes(updatedNotes)
    } catch (error) {
      console.error("Error restoring note:", error)
    }
  }

  const handlePermanentDelete = async (noteId: string) => {
    try {
      // In a real app, this would be an actual API call
      const updatedNotes = notes.filter((note) => note._id !== noteId)
      setNotes(updatedNotes)
    } catch (error) {
      console.error("Error permanently deleting note:", error)
    }
  }

  const handleCreateTag = async (tagName: string, color = "#4285f4") => {
    try {
      // In a real app, this would be an actual API call
      const newTag: Tag = {
        _id: Date.now().toString(),
        name: tagName,
        color,
        userId: "user1", // In a real app, this would be the actual user ID
      }
      setTags([...tags, newTag])
      return newTag
    } catch (error) {
      console.error("Error creating tag:", error)
      return null
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleViewChange = (view: string, tagId?: string) => {
    setActiveView(view)
    setSelectedTag(tagId || null)
  }

  return (
    <div className="dashboard">
      <Sidebar activeView={activeView} tags={tags} onViewChange={handleViewChange} onSearch={handleSearch} />

      <main className="main-content">
        <NoteList
          notes={notes}
          activeView={activeView}
          onCreateNote={() =>
            setActiveNote({
              _id: "new",
              title: "",
              content: "",
              tags: [],
              color: "#ffffff",
              isArchived: false,
              isDeleted: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
          onEditNote={setActiveNote}
          onArchiveNote={handleArchiveNote}
          onDeleteNote={handleDeleteNote}
          onRestoreNote={handleRestoreNote}
          onPermanentDelete={handlePermanentDelete}
          tags={tags}
        />

        {activeNote && (
          <NoteEditor
            note={activeNote}
            tags={tags}
            onSave={activeNote._id === "new" ? handleCreateNote : handleUpdateNote}
            onCancel={() => setActiveNote(null)}
            onCreateTag={handleCreateTag}
          />
        )}
      </main>
    </div>
  )
}
