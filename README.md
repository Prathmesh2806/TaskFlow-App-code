# TaskFlow — Project Management Application

A full-stack Jira-like task management application built with Java Spring Boot and a modern web frontend.

## Features

- **Dashboard** — Overview with task statistics and distribution charts
- **Kanban Board** — Drag-and-drop task cards across columns (To Do → In Progress → In Review → Done)
- **Task Management** — Create, edit, assign, prioritize, and track tasks with due dates
- **Projects** — Organize tasks into projects with unique keys (e.g., WEB-1, MOB-3)
- **Team Management** — Add and manage team members
- **Search** — Real-time search across all tasks
- **Responsive Design** — Works on desktop, tablet, and mobile

## Prerequisites

- **Java 17** or higher installed ([Download Java](https://adoptium.net/))
- No other software needed! Database and web server are embedded.

## How to Run

### On Windows:
```bash
mvnw.cmd spring-boot:run
```

### On Mac/Linux:
```bash
chmod +x mvnw
./mvnw spring-boot:run
```

Then open your browser and go to: **http://localhost:9999**

## Sharing with Others

To run this app on another machine:

1. Copy the entire project folder
2. Make sure Java 17+ is installed on that machine
3. Open terminal in the project folder
4. Run the appropriate command above

**That's it!** No database setup, no server configuration needed.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend   | Java 17 + Spring Boot 3.2 |
| Database  | H2 (embedded, file-based) |
| Frontend  | HTML5 + CSS3 + JavaScript |
| Build     | Maven (with wrapper) |

## Project Structure

```
├── pom.xml                              # Maven configuration
├── mvnw / mvnw.cmd                      # Maven wrapper scripts
├── src/main/java/com/taskmanager/
│   ├── TaskManagerApplication.java      # Main entry point
│   ├── model/                           # JPA entities
│   ├── repository/                      # Data access layer
│   ├── service/                         # Business logic
│   ├── controller/                      # REST API endpoints
│   └── config/                          # Configuration & data seeder
├── src/main/resources/
│   ├── application.properties           # App configuration
│   └── static/                          # Frontend files
│       ├── index.html
│       ├── css/style.css
│       └── js/app.js
└── data/                                # H2 database files (auto-created)
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Dashboard statistics |
| GET/POST | /api/tasks | List/Create tasks |
| GET/PUT/DELETE | /api/tasks/{id} | Get/Update/Delete task |
| PATCH | /api/tasks/{id}/status | Update task status |
| GET/POST | /api/projects | List/Create projects |
| GET/PUT/DELETE | /api/projects/{id} | Get/Update/Delete project |
| GET/POST | /api/users | List/Create users |
| GET/PUT/DELETE | /api/users/{id} | Get/Update/Delete user |
