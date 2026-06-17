# NexChain Assignment

A full-stack web application with a Node.js/Express backend and a React/Vite frontend.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router |
| Backend | Node.js, Express 5, Mongoose, JWT Auth |
| Database | MongoDB 7.0 (via Docker) |

---

## Prerequisites

- **Node.js** >= 18
- **Docker** & Docker Compose
- **npm** (comes with Node.js)

---

## Project Structure

```
NexChain-assignment/
├── backend/          # Express API server
│   ├── src/
│   │   ├── server.js
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── jobs/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── docker-compose.yml
│   ├── package.json
│   └── .env
├── frontend/         # React + Vite client
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── README.md
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd NexChain-assignment
```

### 2. Start MongoDB via Docker

```bash
cd backend
docker compose up -d
```

This starts:
- **MongoDB** on port `27017`
- **Mongo Express UI** (optional) on port `8081` — visit http://localhost:8081

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file (copy from example)
cp .env.bak .env   # or create manually — see below

# Start dev server
npm run dev
```

Backend runs on **http://localhost:5000**

#### Backend `.env` (reference)

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://admin:secret123@localhost:27017/nexachain_db?authSource=admin
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=7d
COOKIE_NAME=nexchain_token
CORS_ORIGIN=http://localhost:5173
```

### 4. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

---

## Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start server with nodemon (auto-reload) |
| `npm start` | Start server in production mode |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## Frontend Proxy

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS issues during development.
