const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/notemaster";

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser());

// MongoDB connection
mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true }
);

// Note Schema
const noteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, default: "" },
    content: { type: String, required: true },
    tags: [{ type: String }],
    color: { type: String, default: "#ffffff" },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    reminderDate: { type: Date },
  },
  { timestamps: true }
);

// Tag Schema
const tagSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    color: { type: String, default: "#4285f4" },
  },
  { timestamps: true }
);

// Create indexes
noteSchema.index({ userId: 1, isDeleted: 1, isArchived: 1 });
noteSchema.index({ userId: 1, tags: 1 });
noteSchema.index({ userId: 1, title: "text", content: "text" });
tagSchema.index({ userId: 1, name: 1 }, { unique: true });

const User = mongoose.model("User", userSchema);
const Note = mongoose.model("Note", noteSchema);
const Tag = mongoose.model("Tag", tagSchema);

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  const token = req?.cookies?.token; // Get token from cookie

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

//
const noStore = (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create default tags
    const defaultTags = [
      { name: "personal", color: "#4285f4" },
      { name: "work", color: "#34a853" },
      { name: "ideas", color: "#fbbc04" },
    ];

    for (const tagData of defaultTags) {
      const tag = new Tag({
        userId: user._id,
        ...tagData,
      });
      await tag.save();
    }

    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set the token in an HttpOnly cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use secure in production
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({ message: "Logged out successfully" });
});

// Notes Routes
app.get("/api/notes", authenticateToken, noStore, async (req, res) => {
  try {
    const { view = "notes", tag, search } = req.query;
    const userId = req.user._id;

    // Build query
    const query = { userId };

    // Filter by view
    if (view === "archived") {
      query.isArchived = true;
      query.isDeleted = false;
    } else if (view === "trash") {
      query.isDeleted = true;
    } else if (view === "reminders") {
      query.reminderDate = { $exists: true, $ne: null };
      query.isDeleted = false;
    } else if (view === "upcoming") {
      const now = new Date();
      query.reminderDate = { $exists: true, $ne: null, $gte: now };
      query.isDeleted = false;
    } else if (view === "tag" && tag) {
      query.tags = tag;
      query.isDeleted = false;
      query.isArchived = false;
    } else {
      query.isDeleted = false;
      query.isArchived = false;
    }

    // Search functionality
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    let notesQuery = Note.find(query);

    // Sort by relevance if searching, otherwise by update date
    if (search) {
      notesQuery = notesQuery.sort({ score: { $meta: "textScore" } });
    } else {
      notesQuery = notesQuery.sort({ updatedAt: -1 });
    }

    const notes = await notesQuery.exec();

    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/notes", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      tags = [],
      color = "#ffffff",
      reminderDate,
    } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (tags.length > 9) {
      return res.status(400).json({ message: "Maximum 9 tags allowed" });
    }

    const note = new Note({
      userId: req.user._id,
      title,
      content,
      tags,
      color,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
    });

    await note.save();
    res.status(201).json(note);
  } catch (error) {
    console.error("Error creating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    const {
      title,
      content,
      tags = [],
      color = "#ffffff",
      reminderDate,
      isArchived,
      isDeleted,
    } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    if (tags.length > 9) {
      return res.status(400).json({ message: "Maximum 9 tags allowed" });
    }

    const updateData = {
      title,
      content,
      tags,
      color,
      reminderDate: reminderDate ? new Date(reminderDate) : null,
      updatedAt: new Date(),
    };

    if (typeof isArchived === "boolean") {
      updateData.isArchived = isArchived;
    }

    if (typeof isDeleted === "boolean") {
      updateData.isDeleted = isDeleted;
      if (isDeleted) {
        updateData.deletedAt = new Date();
      } else {
        updateData.deletedAt = null;
      }
    }

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData,
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/notes/:id", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      {
        isDeleted: true,
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.json({ message: "Note moved to trash" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/notes/:id/permanent", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: true,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found in trash" });
    }

    res.json({ message: "Note permanently deleted" });
  } catch (error) {
    console.error("Error permanently deleting note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/notes/:id/restore", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id, isDeleted: true },
      {
        isDeleted: false,
        deletedAt: null,
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found in trash" });
    }

    res.json(note);
  } catch (error) {
    console.error("Error restoring note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/notes/:id/archive", authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOne({
      _id: req.params.id,
      userId: req.user._id,
      isDeleted: false,
    });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    note.isArchived = !note.isArchived;
    note.updatedAt = new Date();
    await note.save();

    res.json(note);
  } catch (error) {
    console.error("Error archiving note:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Tags Routes
app.get("/api/tags", authenticateToken, async (req, res) => {
  try {
    const tags = await Tag.find({ userId: req.user._id }).sort({ name: 1 });
    res.json(tags);
  } catch (error) {
    console.error("Error fetching tags:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/api/tags", authenticateToken, async (req, res) => {
  try {
    const { name, color = "#4285f4" } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({
      userId: req.user._id,
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingTag) {
      return res.status(400).json({ message: "Tag already exists" });
    }

    const tag = new Tag({
      userId: req.user._id,
      name,
      color,
    });

    await tag.save();
    res.status(201).json(tag);
  } catch (error) {
    console.error("Error creating tag:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/tags/:id", authenticateToken, async (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    // Step 1: Find the existing tag to get the old name
    const existingTag = await Tag.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!existingTag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    const oldName = existingTag.name;

    // Step 2: Update the tag document
    const updatedTag = await Tag.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { name, color, updatedAt: new Date() },
      { new: true }
    );
    // Step 3: If name changed, update notes
    if (oldName !== name) {

      await Note.updateMany(
        { userId: req.user._id, tags: oldName },
        { $set: { "tags.$": name } } // $ updates the matched element in the array
      );
    }

    res.json(updatedTag);
  } catch (error) {
    console.error("Error updating tag:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.delete("/api/tags/:id", authenticateToken, async (req, res) => {
  try {
    const tag = await Tag.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }

    // Remove tag from all notes
    await Note.updateMany(
      { userId: req.user._id },
      { $pull: { tags: tag.name } }
    );

    res.json({ message: "Tag deleted successfully" });
  } catch (error) {
    console.error("Error deleting tag:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Cleanup job for permanently deleting old trash notes (30 days)
const cleanupOldNotes = async () => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await Note.deleteMany({
      isDeleted: true,
      deletedAt: { $lt: thirtyDaysAgo },
    });

    console.log(`Cleaned up ${result.deletedCount} old notes`);
  } catch (error) {
    console.error("Error cleaning up old notes:", error);
  }
};

// Run cleanup job daily
setInterval(cleanupOldNotes, 24 * 60 * 60 * 1000);

// Serve static files
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
