"use client"
import type { Note, Tag } from "@/lib/types"

interface NoteListProps {
  notes: Note[]
  activeView: string
  tags: Tag[]
  onCreateNote: () => void
  onEditNote: (note: Note) => void
  onArchiveNote: (noteId: string) => void
  onDeleteNote: (noteId: string) => void
  onRestoreNote: (noteId: string) => void
  onPermanentDelete: (noteId: string) => void
}

export default function NoteList({
  notes,
  activeView,
  tags,
  onCreateNote,
  onEditNote,
  onArchiveNote,
  onDeleteNote,
  onRestoreNote,
  onPermanentDelete,
}: NoteListProps) {
  const isTrashView = activeView === "trash"

  const getTagColor = (tagName: string) => {
    const tag = tags.find((t) => t.name === tagName)
    return tag ? tag.color : "#4285f4"
  }

  const formatDate = (date?: Date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="note-list-container">
      <div className="note-list-header">
        <h2>{activeView.charAt(0).toUpperCase() + activeView.slice(1)}</h2>
        {!isTrashView && (
          <button className="btn-create" onClick={onCreateNote}>
            <i className="fas fa-plus"></i>
            <span>Create Note</span>
          </button>
        )}
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-sticky-note"></i>
          <p>No notes found</p>
        </div>
      ) : (
        <div className="note-grid">
          {notes.map((note) => (
            <div
              key={note._id}
              className="note-card"
              style={{ backgroundColor: note.color }}
              onClick={() => onEditNote(note)}
            >
              {note.title && <h3 className="note-title">{note.title}</h3>}
              <div className="note-content">{note.content}</div>

              {note.reminderDate && (
                <div className="note-reminder">
                  <i className="fas fa-bell"></i>
                  <span>{formatDate(note.reminderDate)}</span>
                </div>
              )}

              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="note-tag" style={{ backgroundColor: getTagColor(tag) }}>
                      {tag}
                    </span>
                  ))}
                  {note.tags.length > 3 && <span className="note-tag-more">+{note.tags.length - 3}</span>}
                </div>
              )}

              <div className="note-actions">
                {isTrashView ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRestoreNote(note._id)
                      }}
                      title="Restore"
                    >
                      <i className="fas fa-trash-restore"></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onPermanentDelete(note._id)
                      }}
                      title="Delete permanently"
                      className="delete-btn"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onArchiveNote(note._id)
                      }}
                      title={note.isArchived ? "Unarchive" : "Archive"}
                    >
                      <i className={`fas ${note.isArchived ? "fa-inbox" : "fa-archive"}`}></i>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteNote(note._id)
                      }}
                      title="Delete"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
