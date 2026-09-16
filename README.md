# AI TriggerX

AI TriggerX is a full-stack workflow automation application that combines a React workflow editor with a Node.js API, MongoDB persistence, Redis-backed job processing, and AI-powered integrations.

## Overview

The project is structured as two applications:

- **Frontend** — React + Vite workflow interface with node-based editing.
- **Backend** — Express API with authentication, workflow execution, queues, logging, and persistence.
- **Worker** — Bull/Redis worker for background job processing.

## Tech Stack

**Frontend**
- React 18
- Vite
- React Router
- React Flow (@xyflow/react)
- Axios
- Lucide React
- React Hot Toast

**Backend**
- Node.js
- Express
- MongoDB + Mongoose
- Redis + Bull
- JWT authentication
- Joi validation
- OpenAI API
- Resend
- Helmet
- Express Rate Limit
- Winston logging

## Architecture

```
React Workflow Editor
        |
        v
Express REST API
   |         |
MongoDB    Redis/Bull
             |
             v
        Background Worker
             |
       External Services
```

The backend starts the HTTP API, while the worker consumes queued jobs asynchronously. This keeps long-running workflow tasks away from the request/response path.

## Project Structure

```
Ai---TriggerX/
├── backend/
│   ├── src/
│   ├── server.js
│   ├── start.js
│   └── package.json
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
└── .gitignore
```

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/VishalDipake/Ai---TriggerX.git
cd Ai---TriggerX
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create a `.env` file with the database, Redis, authentication, AI, email, and application configuration required by the backend.

### 3. Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4. Run the applications

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

For the backend, `npm run worker` starts the queue worker independently. `start.js` can be used to start both the server and worker together.

## Key Engineering Concepts

- Workflow orchestration
- Queue-based asynchronous processing
- REST API design
- JWT authentication
- MongoDB data persistence
- Redis-backed background jobs
- AI API integration
- Request validation and rate limiting
- Structured logging
- Graceful server shutdown

## Environment Variables

Do not commit secrets. Configure values such as database credentials, Redis configuration, JWT secrets, AI API keys, email credentials, and frontend API URLs through environment variables.

## Status

This repository is an actively structured full-stack automation project and is intended to demonstrate workflow orchestration, asynchronous processing, and AI integration.
