import { NextResponse } from "next/server"
import type { Note } from "@/lib/types"

// In a real app, this would connect to MongoDB
export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url)
    const view = url.searchParams.get("view") || "notes"
    const tag = url.searchParams.get("tag")
    const search = url.searchParams.get("search")

    // In a real app, we would:
    // 1. Verify the user's session
    // 2. Query MongoDB for the user's notes based on filters

    // For demo purposes, we'll return mock data
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
      {
        _id: "3",
        title: "Project Ideas",
        content: "1. Note taking app\n2. Weather app\n3. Task manager",
        tags: ["ideas", "projects"],
        color: "#cbf0f8",
        isArchived: true,
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        _id: "4",
        title: "Old Note",
        content: "This note is in the trash",
        tags: [],
        color: "#ffffff",
        isArchived: false,
        isDeleted: true,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    // Filter notes based on view
    let filteredNotes = mockNotes
    if (view === "archived") {
      filteredNotes = mockNotes.filter((note) => note.isArchived)
    } else if (view === "trash") {
      filteredNotes = mockNotes.filter((note) => note.isDeleted)
    } else if (view === "reminders") {
      filteredNotes = mockNotes.filter((note) => note.reminderDate)
    } else if (view === "tag" && tag) {
      filteredNotes = mockNotes.filter((note) => note.tags.includes(tag))
    } else {
      filteredNotes = mockNotes.filter((note) => !note.isArchived && !note.isDeleted)
    }

    // Apply search filter if query exists
    if (search) {
      const query = search.toLowerCase()
      filteredNotes = filteredNotes.filter(
        (note) => note.title.toLowerCase().includes(query) || note.content.toLowerCase().includes(query),
      )
    }

    return NextResponse.json(filteredNotes)
  } catch (error) {
    console.error("Error fetching notes:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const noteData = await request.json()

    // Validate input
    if (!noteData.content) {
      return NextResponse.json({ message: "Note content is required" }, { status: 400 })
    }

    // In a real app, we would:
    // 1. Verify the user's session
    // 2. Create the note in MongoDB

    // For demo purposes, we'll just return a mock created note
    const newNote: Note = {
      _id: Date.now().toString(),
      title: noteData.title || "",
      content: noteData.content,
      tags: noteData.tags || [],
      color: noteData.color || "#ffffff",
      isArchived: false,
      isDeleted: false,
      reminderDate: noteData.reminderDate ? new Date(noteData.reminderDate) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return NextResponse.json(newNote, { status: 201 })
  } catch (error) {
    console.error("Error creating note:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
