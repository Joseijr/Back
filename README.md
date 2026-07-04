# Express.js Backend — Student Starter Template

This is a beginner-friendly Express.js project template. It gives you a clean, organized starting point without worrying about project setup.

---

## What is this project?

This project is a **web server** built with [Node.js](https://nodejs.org/) and [Express.js](https://expressjs.com/).

- **Node.js** — lets you run JavaScript outside the browser (i.e., on your computer or a server).
- **Express.js** — a library that makes it easy to create a web server and handle HTTP requests (GET, POST, etc.) in Node.js.

---

## Prerequisites

Before running this project, make sure you have installed:

- [Node.js](https://nodejs.org/) (v18 or newer recommended) — includes `npm` automatically

---

## Getting Started

Follow these steps to run the project on your machine:

```bash
# 1. Install all dependencies listed in package.json
npm install

# 2. Create your local environment file by copying the example
#    Then open .env and fill in your own values
cp .env.example .env

# 3. Start the development server (auto-restarts on file changes)
npm run dev

# Or, start it without auto-restart:
npm start
```

Once running, open your browser and go to: **http://localhost:3000**

---

## Folder Structure

```
backend/
│
├── public/                 # Static files served directly to the browser
│   └── favicon.ico         # The small icon shown in the browser tab
│
├── src/                    # All your application source code lives here
│   │
│   ├── routes/             # Defines the URL paths your API responds to
│   │   └── userRoutes.js   # All routes related to "users" (e.g. /api/users)
│   │
│   └── app.js              # Sets up the Express app: middleware, static files, routes
│
├── .env                    # Your secret config values — DO NOT commit this to Git!
├── .env.example            # A safe template showing which variables are needed
├── .gitignore              # Tells Git which files/folders to ignore (e.g. node_modules)
├── package.json            # Project metadata, dependencies, and npm scripts
├── package-lock.json       # Auto-generated lockfile — ensures consistent installs
└── server.js               # Entry point — starts the server and listens on a port
```

---

## How the Code Flows

Understanding how a request travels through the app is key. Here's the journey of a request:

```
Browser / Client
      │
      │  HTTP Request (e.g. GET http://localhost:3000/)
      ▼
  server.js          ← starts the server, defines the port
      │
      ▼
  src/app.js         ← applies middleware (e.g. JSON parser, static files)
      │
      ▼
  src/routes/        ← matches the URL path to the right handler function
      │
      ▼
  Handler function   ← runs your logic and sends a response back
      │
      ▼
Browser / Client     ← receives the response
```

---

## Key Files Explained

### `server.js`
This is where the app **starts**. It imports the configured Express app from `src/app.js` and calls `app.listen()` to begin accepting requests on a port.

> Think of it as the "ON switch" for your server.

### `src/app.js`
This is where the Express app is **configured**. Middleware (functions that process requests before they reach your routes) and route files are registered here. The configured app is exported so `server.js` can use it.

> Think of it as the "setup" file.

### `src/routes/userRoutes.js`
This file groups all routes related to a specific resource (users). Instead of putting all routes in one giant file, we split them by resource to keep the code organized and easy to navigate.

> Think of it as a menu of available actions for "users".

### `public/`
Any file placed here is served **directly** by the server. For example, placing `favicon.ico` here means the browser can fetch it at `http://localhost:3000/favicon.ico` automatically.

### `.env` vs `.env.example`
| File | Purpose | Committed to Git? |
|---|---|---|
| `.env` | Your actual secret values (passwords, API keys) | ❌ No — it's in `.gitignore` |
| `.env.example` | A template showing which variables are needed | ✅ Yes — safe to share |

Always copy `.env.example` → `.env` and fill in your own values when setting up the project.

---

## npm Scripts

These commands are defined in `package.json` under `"scripts"`:

| Command | What it does |
|---|---|
| `npm start` | Starts the server with `node` (no auto-restart) |
| `npm run dev` | Starts the server with `nodemon` (auto-restarts on file save) |

> Use `npm run dev` while you are developing. Use `npm start` in production.

---

## Common Errors & Fixes

| Error | Likely Cause | Fix |
|---|---|---|
| `Cannot find module 'express'` | Dependencies not installed | Run `npm install` |
| `app.get is not a function` | `app` was not exported from `app.js` | Add `module.exports = app;` at the bottom of `src/app.js` |
| `EADDRINUSE: address already in use` | Another process is using the port | Change `PORT` in `.env`, or stop the other process |
| `favicon.ico 404 Not Found` | Static file middleware not set up | Add `app.use(express.static(...))` in `src/app.js` |
