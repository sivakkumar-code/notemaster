export interface User {
  _id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export interface Note {
  _id: string
  title: string
  content: string
  tags: string[]
  color: string
  isArchived: boolean
  isDeleted: boolean
  deletedAt?: Date
  reminderDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Tag {
  _id: string
  userId: string
  name: string
  color: string
}
