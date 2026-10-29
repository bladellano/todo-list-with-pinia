# CLAUDE.md - Todo List App

## Project Overview

**Todo List com Tags** - Full-stack web application for personal task management with Vue.js 3, Node.js/Express, and JSON-based persistence.

### Key Technologies
- **Frontend:** Vue.js 3 (Composition API), Vite, Pinia (state management), Tailwind CSS
- **Backend:** Node.js, Express.js
- **Data Storage:** JSON file (`backend/data/data.json`)
- **Optional Integrations:** OpenAI (text improvement), n8n (email automation)

## Architecture & File Organization

### Frontend Structure
```
frontend/src/
├── components/        # Vue components (TodoItem, TodoEditModal, etc)
├── stores/           # Pinia stores (auth, todo, tag, theme)
├── composables/      # Reusable logic (useSuggestions, useAI, useDragAndDrop, etc)
├── views/            # Page components (HomeView, ArchivedView, TagsView, LoginView)
├── router/           # Vue Router config
└── utils/            # Utility functions (colors.js for tag colors)
```

### Backend Structure
```
backend/
├── routes/           # API endpoints (auth, todos, tags, data, ai)
├── utils/            # Storage utilities (JSON read/write)
└── data/             # data.json (persistent storage)
```

## Development Patterns

### Vue 3 Composition API
- Always use `<script setup>` syntax
- Extract reusable logic into composables in `frontend/src/composables/`
- Use Pinia stores for global state (auth, todo list, tags, theme)

### Key Composables
- `useDragAndDrop` - Drag-and-drop reordering (list view only)
- `useSuggestions` - Task autocomplete suggestions
- `useAI` - OpenAI integration for text improvement
- `useExport` - Data export/import functionality
- `useTodoFilters` - Search and tag filtering
- `useToast` - Toast notifications (success/error/info)

### Pinia Stores
- `auth.js` - User authentication + localStorage persistence
- `todo.js` - Task CRUD, ordering, pinned/archived state
- `tag.js` - Tag CRUD
- `theme.js` - Dark/light mode preference

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username/password

### Todos
- `GET /api/todos` - List all tasks
- `POST /api/todos` - Create task
- `PUT /api/todos/:id` - Update task (supports: title, description, tagIds, done, pinned, archived, notificable, sendByEmail, emails, sendFrequency, sendTime)
- `DELETE /api/todos/:id` - Delete task
- `GET /api/todos/order` - Get custom task order
- `PUT /api/todos/order` - Update task order

### Tags
- `GET /api/tags` - List all tags
- `POST /api/tags` - Create tag
- `PUT /api/tags/:id` - Update tag
- `DELETE /api/tags/:id` - Delete tag

### Data Management
- `GET /api/data/export` - Export full backup (JSON)
- `POST /api/data/import` - Import backup

### AI Features
- `POST /api/ai/improve-text` - Improve text with OpenAI (requires OPENAI_API_KEY)

## Running the Application

### Install Dependencies
```bash
npm run install:all  # Installs root, backend, and frontend dependencies
```

### Development
```bash
npm run dev  # Runs both backend and frontend concurrently
# Backend: http://localhost:3001
# Frontend: http://localhost:5173
```

### Login Credentials
- Username: `admin`
- Password: `admin`

## Data Structure (data.json)

The application stores everything in a single JSON file:

```json
{
  "users": [{ "id": 1, "username": "admin", "password": "admin" }],
  "todos": [
    {
      "id": 1234567890,
      "title": "Task title",
      "description": "Optional description",
      "tagIds": [1, 2],
      "done": false,
      "pinned": false,
      "archived": false,
      "notificable": false,
      "sendByEmail": true,
      "emails": ["user@example.com"],
      "sendFrequency": "daily|weekly|monthly",
      "sendTime": "09:00",
      "createdAt": "2026-01-23T00:00:00.000Z",
      "completedAt": null
    }
  ],
  "tags": [{ "id": 1234567890, "name": "Important", "color": "#FF0000" }],
  "todoOrder": [3, 1, 2]  // Custom task ordering
}
```

## Important Implementation Notes

### Known Limitations
- Simple authentication without encryption (personal use only)
- Single file JSON storage (not thread-safe for concurrent writes)
- No multi-user support with proper session management
- Not production-ready for sensitive data

### Environment Variables
```env
# Backend
PORT=3001
OPENAI_API_KEY=optional-key-for-ai-features
OPENAI_MODEL=gpt-4o-mini

# Frontend
VITE_API_URL=http://localhost:3001
```

### UI Features
- Responsive design with Tailwind CSS
- Dark mode with localStorage persistence
- Toast notifications for user feedback
- Drag-and-drop reordering (list view only)
- Multiple grid view layouts (2-8 columns)
- Task archival and pinning
- Email sending automation via n8n integration

## Code Style & Conventions

- Use descriptive variable names (avoid abbreviations)
- Keep components focused and under 200 lines when possible
- Extract reusable logic into composables
- Use TypeScript-ready patterns (proper prop typing in components)
- Comment only non-obvious logic
- Use Tailwind CSS utility classes (avoid custom CSS when possible)

## Testing & Quality

- No automated tests currently in place
- Always test UI changes in browser before considering complete
- Test golden path and edge cases for new features
- Check for regressions in related features

## Common Tasks

### Adding a New Task Property
1. Update the Todo data structure in `backend/utils/storage.js` or the store
2. Add to Pinia `todo.js` store if it affects state
3. Update API routes in `backend/routes/todos.js`
4. Update components that display/edit tasks
5. Test the feature end-to-end

### Adding a New Composable
1. Create `frontend/src/composables/use[Feature].js`
2. Export the composable as the default export
3. Import and use in components with `<script setup>`
4. Add documentation comment at the top

### Working with Tags
- Tags have `id`, `name`, and `color` properties
- Colors are stored as hex strings
- Tag colors are defined in `frontend/src/utils/colors.js`
- Use `useTagStore()` in components to access/modify tags

## Documentation Files

Key documentation files to reference:
- `docs/QUICK-START.md` - Getting started guide
- `docs/ARQUITETURA.md` - Detailed technical architecture
- `docs/N8N-INTEGRATION.md` - n8n email automation setup
- `docs/EMAIL-SENDING.md` - Email feature documentation
- `docs/EXEMPLOS-USO.md` - Usage examples

---

**Last Updated:** 2026-10-29
