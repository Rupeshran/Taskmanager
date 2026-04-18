# TaskFlow — Full-Stack Task Manager

> Production-ready task manager built with Node.js, Express, MongoDB, and Vanilla JS.
> Built as a Full-Stack Developer internship assignment.

---

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | HTML5, CSS3, Vanilla JavaScript     |
| Backend      | Node.js + Express                   |
| Database     | MongoDB (Mongoose ODM)              |
| Auth         | JWT + bcrypt (12 salt rounds)       |
| Security     | Helmet, express-rate-limit, mongo-sanitize, express-validator |
| Logging      | Morgan                              |
| Deployment   | Render (backend) + Netlify (frontend) |

---

## Project Structure

```
taskmanager/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js     # Register, Login, GetMe
│   │   └── task.controller.js     # CRUD operations
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification guard
│   │   ├── error.middleware.js    # Global error + 404 handler
│   │   └── rateLimiter.middleware.js  # Brute-force protection
│   ├── models/
│   │   ├── User.js                # User schema (bcrypt pre-save hook)
│   │   └── Task.js                # Task schema
│   ├── routes/
│   │   ├── auth.routes.js         # POST /api/auth/register, /login, GET /me
│   │   └── task.routes.js         # GET/POST/PUT/DELETE /api/tasks
│   ├── .env.example               # Environment variable template
│   ├── .gitignore
│   ├── package.json
│   ├── render.yaml                # Render deployment config
│   └── server.js                  # App entry point
│
├── frontend/
│   ├── css/
│   │   ├── style.css              # Shared / auth page styles
│   │   └── dashboard.css          # Dashboard-specific styles
│   ├── js/
│   │   ├── api.js                 # Fetch wrapper, token management, route guards
│   │   ├── auth.js                # Login / register / logout handlers
│   │   └── dashboard.js           # Task CRUD, filters, toast notifications
│   ├── index.html                 # Landing page
│   ├── login.html
│   ├── register.html
│   └── dashboard.html
│
├── netlify.toml                   # Netlify deployment config
├── .gitignore
└── README.md
```

---

## API Endpoints

### Auth

| Method | Endpoint               | Body                          | Auth? | Description          |
|--------|------------------------|-------------------------------|-------|----------------------|
| POST   | /api/auth/register     | name, email, password         | No    | Register new user    |
| POST   | /api/auth/login        | email, password               | No    | Login, get JWT token |
| GET    | /api/auth/me           | —                             | Yes   | Get current user     |

### Tasks

| Method | Endpoint           | Body               | Auth? | Description               |
|--------|--------------------|--------------------|-------|---------------------------|
| GET    | /api/tasks         | —                  | Yes   | Get all tasks for user    |
| POST   | /api/tasks         | title              | Yes   | Create a new task         |
| PUT    | /api/tasks/:id     | title?, completed? | Yes   | Update task (toggle/edit) |
| DELETE | /api/tasks/:id     | —                  | Yes   | Delete a task             |

All protected routes require:
```
Authorization: Bearer <your_jwt_token>
```

---

## Security Features

- ✅ **bcrypt** password hashing (12 salt rounds)
- ✅ **JWT** with 1h expiration
- ✅ **express-validator** input validation on all routes
- ✅ **mongo-sanitize** NoSQL injection prevention
- ✅ **helmet** secure HTTP headers
- ✅ **express-rate-limit**: 10 auth attempts / 15 min per IP
- ✅ **Generic error messages** — no internal info leakage
- ✅ **Password rules**: min 8 chars, uppercase, lowercase, number
- ✅ **Payload size limit**: 10kb max on JSON body
- ✅ **Environment variables** for all secrets
- ✅ **CORS** locked to allowed origins

---

## Local Development Setup

### Prerequisites
- Node.js >= 18.x
- MongoDB Atlas account (free tier works fine)
- Git

### 1. Clone the repo
```bash
git clone https://github.com/your-username/taskmanager.git
cd taskmanager
```

### 2. Install backend dependencies
```bash
cd backend
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_64_char_random_string
JWT_EXPIRES_IN=1h
FRONTEND_URL=http://127.0.0.1:5500
```

**Generate a strong JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. Start the backend server
```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```
Backend runs at: `http://localhost:5000`

### 5. Serve the frontend
Open `frontend/index.html` with **Live Server** (VS Code extension) or any static file server.

With Python:
```bash
cd frontend
python3 -m http.server 5500
```

Then open: `http://localhost:5500`

### 6. Set the API URL
In `frontend/js/api.js`, ensure:
```js
const API_BASE = window.ENV_API_URL || "http://localhost:5000";
```
This defaults to `localhost:5000` for local dev. For production, set `window.ENV_API_URL` via Netlify environment variables (see below).

---

## MongoDB Atlas Setup

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a **free M0 cluster** (any region)
3. In **Database Access**: create a user with username + password → grant **Read and write** permissions
4. In **Network Access**: click **Add IP Address** → choose **Allow Access from Anywhere** (`0.0.0.0/0`) for deployment
5. Click **Connect** on your cluster → **Connect your application** → copy the connection string
6. Replace `<password>` with your database user's password and `<dbname>` with `taskmanager`

Example URI:
```
mongodb+srv://myuser:mypassword@cluster0.abc12.mongodb.net/taskmanager?retryWrites=true&w=majority
```

---

## Deployment Guide

### Backend → Render.com

1. Push your code to GitHub
2. Go to [render.com](https://render.com) and sign up (free)
3. Click **New +** → **Web Service**
4. Connect your GitHub repo
5. Configure:
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add **Environment Variables** in Render dashboard:

| Key            | Value                                    |
|----------------|------------------------------------------|
| `NODE_ENV`     | `production`                             |
| `PORT`         | `5000`                                   |
| `MONGO_URI`    | your MongoDB Atlas connection string     |
| `JWT_SECRET`   | your 64-char random secret               |
| `JWT_EXPIRES_IN` | `1h`                                   |
| `FRONTEND_URL` | `https://your-app.netlify.app`           |

7. Click **Create Web Service**
8. Your API URL will be: `https://taskflow-api.onrender.com`

> **Note**: Free Render instances spin down after 15 minutes of inactivity. The first request after sleep takes ~30s.

---

### Frontend → Netlify

#### Option A: Netlify Drop (Quickest)
1. Go to [app.netlify.com/drop](https://app.netlify.com/drop)
2. Drag and drop your `frontend/` folder
3. Done! You'll get a URL like `https://random-name.netlify.app`

#### Option B: Git Deploy (Recommended)
1. Push your full repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**
3. Connect your repo
4. Configure:
   - **Base directory**: (leave empty)
   - **Publish directory**: `frontend`
   - **Build command**: (leave empty)
5. Add **Environment Variables** in Netlify:
   - `NODE_ENV` = `production`
6. Set your backend URL in `frontend/js/api.js`:
```js
const API_BASE = window.ENV_API_URL || "https://taskflow-api.onrender.com";
```

Or use Netlify's `_redirects` / `netlify.toml` to inject it dynamically.

7. Go to **Site settings** → **Environment variables** and add:
   - `VITE_API_URL` (if using a bundler) or set directly in `api.js`
8. **Update CORS**: Set `FRONTEND_URL` in Render to your Netlify URL

---

### Post-Deployment Checklist

- [ ] Backend health check: `https://your-api.onrender.com/health` → should return `{"status":"ok"}`
- [ ] Register a user via the frontend
- [ ] Login and create tasks
- [ ] Verify tasks persist after page refresh
- [ ] Test logout and re-login
- [ ] Try accessing `/dashboard.html` without being logged in → should redirect to `/login.html`

---

## Environment Variables Reference

### Backend `.env`

```env
# Server
PORT=5000
NODE_ENV=production

# MongoDB Atlas
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/taskmanager?retryWrites=true&w=majority

# JWT
JWT_SECRET=<64-character-random-hex-string>
JWT_EXPIRES_IN=1h

# CORS - your deployed frontend URL
FRONTEND_URL=https://your-app.netlify.app
```

---

## Example API Requests (curl)

```bash
# Register
curl -X POST https://your-api.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Smith","email":"jane@example.com","password":"Secret123"}'

# Login
curl -X POST https://your-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jane@example.com","password":"Secret123"}'

# Get tasks (replace TOKEN with your JWT)
curl https://your-api.onrender.com/api/tasks \
  -H "Authorization: Bearer TOKEN"

# Create task
curl -X POST https://your-api.onrender.com/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Finish internship project"}'

# Toggle task complete (replace TASK_ID)
curl -X PUT https://your-api.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"completed":true}'

# Delete task
curl -X DELETE https://your-api.onrender.com/api/tasks/TASK_ID \
  -H "Authorization: Bearer TOKEN"
```

---

## Features Summary

| Feature               | Status |
|-----------------------|--------|
| User Registration     | ✅     |
| User Login            | ✅     |
| Password Hashing      | ✅ bcrypt 12 rounds |
| JWT Authentication    | ✅ 1h expiry |
| Route Protection      | ✅ middleware |
| Create Task           | ✅     |
| Read Tasks (user-scoped) | ✅  |
| Update Task (toggle)  | ✅     |
| Delete Task           | ✅     |
| Input Validation      | ✅ express-validator |
| NoSQL Injection Guard | ✅ mongo-sanitize |
| Rate Limiting         | ✅ 10 req/15min on auth |
| Secure HTTP Headers   | ✅ helmet |
| Error Handling        | ✅ global middleware |
| Logging               | ✅ morgan |
| Logout                | ✅     |
| CORS                  | ✅ configured |
| Deployment Ready      | ✅ Render + Netlify |

---

## License

MIT
