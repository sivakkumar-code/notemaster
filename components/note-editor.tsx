"use client"

import { useState } from "react"
import type { Note, Tag } from "@/lib/types"

interface NoteEditorProps {
  note: Note
  tags: Tag[]
  onSave: (note: Note) => void
  onCancel: () => void
  onCreateTag: (name: string, color?: string) => Promise<Tag | null>
}

const NOTE_COLORS = [
  "#ffffff", // White
  "#f28b82", // Red
  "#fbbc04", // Orange
  "#fff475", // Yellow
  "#ccff90", // Green
  "#a7ffeb", // Teal
  "#cbf0f8", // Blue
  "#aecbfa", // Dark blue
  "#d7aefb", // Purple
  "#fdcfe8", // Pink
]

export default function NoteEditor({ note, tags, onSave, onCancel, onCreateTag }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [color, setColor] = useState(note.color)
  const [selectedTags, setSelectedTags] = useState<string[]>(note.tags)
  const [reminderDate, setReminderDate] = useState<string>(
    note.reminderDate ? new Date(note.reminderDate).toISOString().slice(0, 16) : "",
  )
  const [newTag, setNewTag] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)

  const handleSave = () => {
    onSave({
      ...note,
      title,
      content,
      color,
      tags: selectedTags,
      reminderDate: reminderDate ? new Date(reminderDate) : undefined,
    })
  }

  const handleTagToggle = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      setSelectedTags(selectedTags.filter((t) => t !== tagName))
    } else {
      if (selectedTags.length < 9) {
        setSelectedTags([...selectedTags, tagName])
      }
    }
  }

  const handleCreateTag = async () => {
    if (newTag.trim()) {
      const tag = await onCreateTag(newTag.trim())
      if (tag) {
        setSelectedTags([...selectedTags, tag.name])
        setNewTag("")
        setShowTagInput(false)
      }
    }
  }

  return (
    <div className="note-editor-overlay">
      <div className="note-editor" style={{ backgroundColor: color }}>
        <div className="note-editor-content">
          <input
            type="text"
            className="note-title-input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="note-content-input"
            placeholder="Take a note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <div className="note-reminder-input">
            <label>
              <i className="fas fa-bell"></i>
              <input type="datetime-local" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
            </label>
            {reminderDate && (
              <button className="btn-clear-reminder" onClick={() => setReminderDate("")}>
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>

          <div className="note-tags-container">
            {selectedTags.map((tagName) => {
              const tagObj = tags.find((t) => t.name === tagName)
              return (
                <span key={tagName} className="selected-tag" style={{ backgroundColor: tagObj?.color || "#4285f4" }}>
                  {tagName}
                  <button onClick={() => handleTagToggle(tagName)}>
                    <i className="fas fa-times"></i>
                  </button>
                </span>
              )
            })}

            {selectedTags.length < 9 &&
              (showTagInput ? (
                <div className="new-tag-input">
                  <input
                    type="text"
                    placeholder="New tag..."
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateTag()
                      } else if (e.key === "Escape") {
                        setShowTagInput(false)
                        setNewTag("")
                      }
                    }}
                    autoFocus
                  />
                  <button onClick={handleCreateTag}>
                    <i className="fas fa-check"></i>
                  </button>
                  <button
                    onClick={() => {
                      setShowTagInput(false)
                      setNewTag("")
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ) : (
                <button className="btn-add-tag" onClick={() => setShowTagInput(true)}>
                  <i className="fas fa-plus"></i>
                  <span>Add Tag</span>
                </button>
              ))}
          </div>
        </div>

        <div className="note-editor-footer">
          <div className="color-picker">
            {NOTE_COLORS.map((c) => (
              <button
                key={c}
                className={`color-option ${color === c ? "active" : ""}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                title={c === "#ffffff" ? "Default" : c}
              ></button>
            ))}
          </div>

          <div className="note-editor-actions">
            <button className="btn-cancel" onClick={onCancel}>
              Cancel
            </button>
            <button className="btn-save" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
