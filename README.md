# Wellness Session Platform

## Overview
This project is a full-stack wellness session platform built for the Arvyax Full Stack Internship Assignment. It allows users to register, log in, view wellness sessions, draft and publish their own sessions, and benefit from auto-save functionality. The platform is designed with security, scalability, and interactivity in mind.

---

## Tech Stack
- **Frontend:** React.js (Vite + TypeScript)
- **Backend:** Django (REST Framework)
- **Database:** Hybrid (MongoDB for sessions, SQLite for Django auth only)
- **Auth:** JWT (SimpleJWT, bcrypt via Django)

> **Note:** This project uses a hybrid approach. SQLite is used only for Django's built-in authentication and admin features, which are not exposed in production. All session/user data for the main app is stored in MongoDB.

---

## Features
- **User Authentication:**
  - Register and login with hashed passwords
  - JWT-based authentication
  - Protected API routes
- **Session Management:**
  - View public wellness sessions
  - View, edit, and manage your own sessions (drafts and published)
  - Draft and publish sessions
  - Auto-save drafts after 5 seconds of inactivity
- **Frontend:**
  - Login/Register forms
  - Dashboard for published sessions
  - My Sessions page for user’s own sessions
  - Session Editor with title, tags, JSON file URL, Save as Draft/Publish, and auto-save
  - Responsive UI
- **Bonus:**
  - Auto-save feedback
  - Logout
  - API documentation (Swagger/OpenAPI)

---

## Folder Structure
```
/backend   # Django REST API, MongoEngine models, JWT auth
/frontend  # React app (Vite + TypeScript)
```

---

## Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.10+
- MongoDB Atlas account (or local MongoDB)

### Backend
1. `cd backend`
2. Create a `.env` file (see `.env.example`)
3. Install dependencies:
   ```sh
   pip install -r requirements.txt
   ```
4. Run migrations (for Django admin/auth):
   ```sh
   python manage.py migrate
   ```
5. Start the server:
   ```sh
   python manage.py runserver
   ```

### Frontend
1. `cd frontend`
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start the dev server:
   ```sh
   npm run dev
   ```

---

## API Endpoints

### Auth
- `POST /api/users/register/` – Register
- `POST /api/users/login/` – Login (returns JWT)

### Sessions
- `GET /api/sessions/` – Public sessions
- `GET /api/my-sessions/` – User’s sessions (draft + published)
- `GET /api/my-sessions/:id/` – View single session
- `POST /api/my-sessions/save-draft/` – Save/update draft
- `POST /api/my-sessions/publish/` – Publish session

### Docs
- Swagger/OpenAPI: `/api/docs/`

---

## Environment Variables
See `/backend/.env.example` for required variables (MongoDB URI, Django secret, etc).

---

## License
MIT
