# NoteMaster - Google Keep-inspired Note-Taking Application

A full-stack note-taking application built with pure HTML, CSS, JavaScript frontend and Node.js/Express/MongoDB backend.

## Features

- **User Authentication**: Secure registration and login system
- **Note Management**: Create, edit, delete, and organize notes
- **Tags System**: Add up to 9 tags per note for better organization
- **Color Coding**: Choose from 10 different background colors for notes
- **Archive & Trash**: Archive notes or move them to trash (auto-delete after 30 days)
- **Reminders**: Set due dates for notes with reminder functionality
- **Search**: Full-text search across all notes
- **Responsive Design**: Works on desktop and mobile devices

## Technology Stack

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with Flexbox/Grid, animations, and responsive design
- **Vanilla JavaScript**: Pure JavaScript with ES6+ features, no frameworks

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database for data storage
- **Mongoose**: MongoDB object modeling library

### Security & Authentication
- **JWT**: JSON Web Tokens for secure authentication
- **bcryptjs**: Password hashing and verification
- **CORS**: Cross-Origin Resource Sharing configuration

## Project Structure

\`\`\`
notemaster/
├── public/                 # Frontend files
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   ├── js/
│   │   ├── utils.js       # Utility functions
│   │   ├── auth.js        # Authentication manager
│   │   ├── api.js         # API client
│   │   ├── notes.js       # Notes management
│   │   ├── tags.js        # Tags management
│   │   └── dashboard.js   # Main dashboard controller
│   ├── index.html         # Login page
│   ├── register.html      # Registration page
│   └── dashboard.html     # Main application
├── server.js              # Express server
├── package.json           # Dependencies and scripts
├── .env.example          # Environment variables template
└── README.md             # Project documentation
\`\`\`

## Database Schema

### User Collection
\`\`\`javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Note Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  title: String,
  content: String,
  tags: [String],
  color: String,
  isArchived: Boolean,
  isDeleted: Boolean,
  deletedAt: Date,
  reminderDate: Date,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

### Tag Collection
\`\`\`javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  name: String,
  color: String,
  createdAt: Date,
  updatedAt: Date
}
\`\`\`

## Installation & Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd notemaster
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Set up environment variables**
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your configuration
   \`\`\`

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   \`\`\`bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   \`\`\`

6. **Access the application**
   Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Notes
- `GET /api/notes` - Get all notes (with filtering)
- `GET /api/notes/:id` - Get specific note
- `POST /api/notes` - Create new note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Move note to trash
- `DELETE /api/notes/:id/permanent` - Permanently delete note
- `POST /api/notes/:id/restore` - Restore note from trash
- `POST /api/notes/:id/archive` - Toggle archive status

### Tags
- `GET /api/tags` - Get all user tags
- `POST /api/tags` - Create new tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

## Features Implementation

### DRY Principle
- **Utility Functions**: Common operations abstracted into `utils.js`
- **API Client**: Centralized API communication in `api.js`
- **Component Managers**: Separate managers for notes, tags, and authentication
- **CSS Variables**: Consistent theming using CSS custom properties
- **Reusable Functions**: Database operations, validation, and error handling

### Scalability Considerations
- **Database Indexing**: Optimized queries with proper indexes
- **Modular Architecture**: Separated concerns for easy maintenance
- **Error Handling**: Comprehensive error handling throughout the application
- **Input Validation**: Both client-side and server-side validation
- **Security**: JWT authentication, password hashing, and input sanitization
- **HttpOnly Cookies**: Used for secure token storage, preventing XSS-based token theft

### Performance Optimizations
- **Debounced Search**: Prevents excessive API calls during typing
- **Lazy Loading**: Notes loaded on demand based on view
- **Efficient Queries**: MongoDB aggregation for complex operations
- **Client-side Caching**: Local storage for authentication state
- **Fragment-based DOM Updates**: `DocumentFragment` used to batch DOM changes and minimize reflows/repaints

## 📌 Credits & Acknowledgments

* Inspired by **Google Keep's** clean and intuitive design
* Built with 💻 and ❤️ by Sivakkumar
* Font Awesome for icons
* MongoDB for flexible data modeling
* Express.js community for excellent documentation
