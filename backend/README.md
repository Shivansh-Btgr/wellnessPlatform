# Wellness Session Platform Backend

This is the backend for the Wellness Session Platform, built with Django and Django REST Framework.

## Features
- Custom user model with email authentication
- JWT authentication (SimpleJWT)
- Session management API (draft/publish, user and public views)
- OpenAPI/Swagger documentation (drf-spectacular)

## Requirements
- Python 3.12+
- Django 5.2+
- djangorestframework
- djangorestframework-simplejwt
- drf-spectacular

## Setup
1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
2. **Apply migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```
3. **Create a superuser:**
   ```bash
   python manage.py createsuperuser
   ```
4. **Run the server:**
   ```bash
   python manage.py runserver
   ```

## API Endpoints

### Session Management
| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/api/sessions`           | Public wellness sessions           |
| GET    | `/api/my-sessions`        | User’s own sessions                |
| GET    | `/api/my-sessions/:id`    | View a single user session         |
| POST   | `/api/my-sessions/save-draft` | Save or update a draft session |
| POST   | `/api/my-sessions/publish`    | Publish a session              |

### Auth
- JWT authentication via `/api/users/` endpoints

### Docs
- Swagger/OpenAPI: `/api/docs/`

## Project Structure
- `users/` - Custom user model, permissions
- `user_sessions/` - Session management (models, views, serializers, urls)
- `project/` - Django project settings and root urls

## License
MIT
