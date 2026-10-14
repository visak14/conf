# GitPulse — GitHub Repository Analytics Dashboard

A full-stack web application that integrates with the GitHub REST API to search public repositories, display detailed repository analytics (including recent commits, top contributors, and open issues), and allows users to bookmark and manage favorite repositories backed by MongoDB.

Built for the **Node.js Full-Stack Developer Internship Technical Assignment**.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | [Next.js](https://nextjs.org/) (App Router, React 19) + [Lucide Icons](https://lucide.dev/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) (Responsive Dark Modern UI) |
| **Backend** | [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/) |
| **Database** | [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM |
| **Caching** | [node-cache](https://www.npmjs.com/package/node-cache) (In-memory, 5-minute TTL) |
| **HTTP Client** | [Axios](https://axios-http.com/) |
| **External API** | [GitHub REST API v3](https://docs.github.com/en/rest) |

---

## 🏗️ Architecture & Data Flow

All external GitHub API interactions strictly proxy through the Express.js backend — avoiding direct client exposure, securing tokens, centralizing error handling, and implementing 5-minute in-memory caching.

```text
┌─────────────────┐        HTTP / REST        ┌──────────────────────────────────┐
│ Next.js Client  │ ────────────────────────> │       Node.js / Express API      │
│  (Port 3000)    │ <──────────────────────── │            (Port 5000)           │
└─────────────────┘                           └───────┬──────────────┬───────────┘
                                                      │              │
                                           Cache Hit? │              │ DB Operations
                                                      ▼              ▼
                                              ┌──────────────┐ ┌───────────────┐
                                              │ In-Memory    │ │    MongoDB    │
                                              │ Cache (5 min)│ │  (Favorites)  │
                                              └──────┬───────┘ └───────────────┘
                                         Cache Miss? │
                                                     ▼
                                              ┌───────────────┐
                                              │  GitHub REST  │
                                              │   API (v3)    │
                                              └───────────────┘
```

---

## ✨ Features Implemented

### A. Repository Search
- **Keyword Search**: Query any open-source GitHub repository.
- **Repository Metadata**: Displays name, owner avatar, description, stars, forks, language indicator, and open issues count.
- **Sorting**: Sort results by **Best Match (default)**, **Most Stars**, or **Recently Updated**.
- **Pagination**: Navigate search result pages with sliding page numbers and bounds checking (up to GitHub's 1,000 results limit).
- **Popular Topic Chips**: Quick one-click search for trending topics (`#react`, `#nextjs`, `#nodejs`, `#express`, `#typescript`, etc.).

### B. Repository Analytics & Details (`/repo/[owner]/[name]`)
- **Key Metrics Grid**: Stars, forks, watchers, open issues, license, default branch, topics, creation and last pushed dates.
- **Top 5 Contributors**: Displays avatars, GitHub usernames, contribution counts, and direct profile links.
- **Latest 5 Commits**: Displays commit messages, authors, avatars, relative timestamps, and short SHA badges linking to GitHub.
- **Direct Save Action**: Bookmark the repository directly from the details view.

### C. Saved Repositories (MongoDB) (`/favorites`)
- **MongoDB Storage**: Bookmarked repositories persist in a MongoDB collection.
- **Dedicated Favorites Page**: View all saved repositories with quick analytics cards.
- **Duplicate Prevention**: Unique indexing and backend conflict checks prevent duplicate entries.
- **Removal**: Remove items from favorites with real-time UI state updates.

### D. Backend API Integration & Caching
- **Proxy Architecture**: All GitHub API requests route through the Express backend.
- **5-Minute Cache**: In-memory caching (`node-cache`) with a 300-second TTL for search queries. Repeated identical queries return instant cached responses marked with `⚡ 5m Cache`.
- **Environment Variables**: Sensitive credentials and configuration securely stored in `.env`.

---

## 🛡️ Mandatory Technical Challenges Handled

| Challenge | Implementation Solution |
|---|---|
| **1. GitHub API returning error / unavailable** | Centralized Axios error handler intercepts GitHub network errors or 5xx server issues, returning structured JSON and clear user alerts without server crash. |
| **2. Invalid or deleted repositories** | When a user accesses a non-existent or deleted repository, the backend returns a clean `404 Not Found`. The frontend displays a dedicated, friendly "Repository Not Found" error card with a back-button. |
| **3. Empty search results** | Clean empty-state view advising the user to try different keywords, preventing crashes or blank screens. |
| **4. Duplicate saved repositories** | MongoDB Schema enforces `githubId: { unique: true }`. The backend controller checks `findOne` prior to insertion and returns `409 Conflict` if duplicate. MongoDB error `11000` is also handled. |
| **5. API rate-limit errors without crashing** | Backend detects `403/429` rate-limit responses, inspects `x-ratelimit-reset`, and returns friendly reset time warnings. Optional `GITHUB_TOKEN` support boosts the rate limit from 60 to 5,000 req/hr. |

---

## 📁 Project Directory Structure

```text
conf/
├── client/                     # Next.js Frontend Application
│   ├── app/
│   │   ├── layout.js           # Root layout with Navbar & Footer
│   │   ├── page.js             # Main Search & Explore dashboard
│   │   ├── favorites/
│   │   │   └── page.js         # Saved Repositories page
│   │   └── repo/[owner]/[name]/
│   │       └── page.js         # Repository Analytics & Details page
│   ├── components/
│   │   ├── Navbar.js           # Navigation bar
│   │   ├── RepoCard.js         # Repository card component
│   │   ├── Pagination.js       # Pagination controls
│   │   ├── AlertBanner.js      # Feedback & Rate-limit alert banner
│   │   └── LoadingSkeleton.js  # Skeleton loaders
│   ├── lib/
│   │   ├── api.js              # Axios API service connecting to Express
│   │   └── utils.js            # Helpers for formatting numbers & language colors
│   ├── .env.example
│   ├── .env.local
│   └── package.json
│
├── server/                     # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js               # MongoDB connection
│   │   └── cache.js            # NodeCache 5-minute configuration
│   ├── controllers/
│   │   ├── githubController.js # Proxy search & repo details with cache
│   │   └── favoriteController.js # MongoDB CRUD & duplicate prevention
│   ├── models/
│   │   └── Favorite.js         # Mongoose Favorite schema
│   ├── routes/
│   │   ├── githubRoutes.js     # /api/github routes
│   │   └── favoriteRoutes.js   # /api/favorites routes
│   ├── middleware/
│   │   └── errorHandler.js     # Centralized error & 404 handler
│   ├── services/
│   │   └── githubService.js    # Axios client & rate-limit error mapper
│   ├── .env.example
│   ├── .env
│   ├── server.js               # Express entry point
│   └── package.json
│
├── .env.example                # Unified environment reference
├── .gitignore
├── package.json                # Root convenience scripts
└── README.md
```

---

## 🚀 Getting Started & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (running locally on port 27017 or a MongoDB Atlas connection URI)

### 1. Clone the repository
```bash
git clone <repository-url>
cd conf
```

### 2. Configure Backend (`server/`)
Create `server/.env` (or copy from `server/.env.example`):
```bash
cd server
cp .env.example .env
```
Inside `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/github_analytics

# Optional: Add a GitHub Personal Access Token to increase rate limit from 60 to 5000 requests/hr
GITHUB_TOKEN=
```

Install backend dependencies:
```bash
npm install
```

Start the backend server:
```bash
npm run dev
# Server runs at http://localhost:5000
# Health check: http://localhost:5000/api/health
```

### 3. Configure Frontend (`client/`)
In a new terminal window:
```bash
cd client
cp .env.example .env.local
```
Inside `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Install frontend dependencies:
```bash
npm install
```

Start the Next.js development server:
```bash
npm run dev
# Frontend runs at http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 Backend API Reference

### GitHub Proxy Endpoints
| Method | Endpoint | Description | Cache |
|---|---|---|---|
| `GET` | `/api/github/search?q={query}&page=1&sort=stars` | Search repositories | **Yes (5 min)** |
| `GET` | `/api/github/repos/:owner/:repo` | Detailed repository info | Direct |
| `GET` | `/api/github/repos/:owner/:repo/commits` | Latest 5 commits | Direct |
| `GET` | `/api/github/repos/:owner/:repo/contributors` | Top 5 contributors | Direct |

### Favorites Endpoints (MongoDB)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/favorites` | Retrieve all saved repositories |
| `POST` | `/api/favorites` | Save repository (prevents duplicate `githubId`) |
| `DELETE` | `/api/favorites/:id` | Remove from favorites (by MongoDB ID or `githubId`) |
| `GET` | `/api/favorites/check/:githubId` | Check if a repository is bookmarked |

---

## 🧪 License
This project is open-source and available under the [MIT License](LICENSE).
