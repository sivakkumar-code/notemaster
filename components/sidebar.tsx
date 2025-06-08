"use client"

import type React from "react"

import { useState } from "react"
import type { Tag } from "@/lib/types"

interface SidebarProps {
  activeView: string
  tags: Tag[]
  onViewChange: (view: string, tagId?: string) => void
  onSearch: (query: string) => void
}

export default function Sidebar({ activeView, tags, onViewChange, onSearch }: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchQuery)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>NoteMaster</h1>
      </div>

      <div className="search-container">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit">
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      <nav className="sidebar-nav">
        <ul>
          <li className={activeView === "notes" ? "active" : ""}>
            <button onClick={() => onViewChange("notes")}>
              <i className="fas fa-lightbulb"></i>
              <span>Notes</span>
            </button>
          </li>
          <li className={activeView === "reminders" ? "active" : ""}>
            <button onClick={() => onViewChange("reminders")}>
              <i className="fas fa-bell"></i>
              <span>Reminders</span>
            </button>
          </li>
          <li className={activeView === "archived" ? "active" : ""}>
            <button onClick={() => onViewChange("archived")}>
              <i className="fas fa-archive"></i>
              <span>Archive</span>
            </button>
          </li>
          <li className={activeView === "trash" ? "active" : ""}>
            <button onClick={() => onViewChange("trash")}>
              <i className="fas fa-trash"></i>
              <span>Trash</span>
            </button>
          </li>
        </ul>
      </nav>

      <div className="sidebar-tags">
        <h3>Labels</h3>
        <ul>
          {tags.map((tag) => (
            <li key={tag._id} className={activeView === "tag" && tag.name === activeView ? "active" : ""}>
              <button onClick={() => onViewChange("tag", tag.name)}>
                <i className="fas fa-tag" style={{ color: tag.color }}></i>
                <span>{tag.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <button className="btn-logout">
          <i className="fas fa-sign-out-alt"></i>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
