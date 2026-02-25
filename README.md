# Personal Dashboard

A full-stack personal dashboard for tracking **companies**, **savings**, **bank economy**, and **personal documents**.

| Layer | Tech |
|---|---|
| Frontend | Vite + React + Tailwind CSS → Netlify |
| Backend | FastAPI (Python) → Vercel |
| Database | PostgreSQL → Supabase |

---

## 📁 Project Structure

```
personal_web/
├── frontend/          # Vite + React + Tailwind
│   ├── src/
│   │   ├── components/   # Layout, CompaniesTab, SavingsTab, EconomyTab, DocumentsTab
│   │   ├── api.js        # Axios API client
│   │   └── App.jsx
│   ├── netlify.toml
│   └── .env.example
├── backend/           # FastAPI
│   ├── main.py
│   ├── database.py
│   ├── models.py
│   ├── routes/
│   │   ├── companies.py
│   │   ├── savings.py
│   │   ├── economy.py
│   │   └── documents.py
│   ├── requirements.txt
│   ├── vercel.json
│   └── .env.example
└── schema.sql         # Supabase table definitions
```

---

## 🚀 Quick Start

### 1. Database (Supabase)

1. Open your [Supabase project](https://supabase.com/dashboard/project/ptmlpxqcuzfxarodqhbc)
2. Go to **SQL Editor** → paste the contents of `schema.sql` and run it

### 2. Backend (Local)

```bash
cd backend
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# or source venv/bin/activate  (Linux/Mac)

pip install -r requirements.txt

# Create your .env file
copy .env.example .env
# Edit .env and set your DATABASE_URL

uvicorn main:app --reload
# API is now running at http://localhost:8000
# Swagger docs: http://localhost:8000/docs
```

**Required `.env` (backend):**
```
DATABASE_URL=postgresql+asyncpg://postgres.ptmlpxqcuzfxarodqhbc:<password>@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

### 3. Frontend (Local)

```bash
cd frontend
npm install

# Create your .env file
copy .env.example .env
# Edit .env and set VITE_API_URL

npm run dev
# App is running at http://localhost:5173
```

**Required `.env` (frontend):**
```
VITE_API_URL=http://localhost:8000
```

---

## ☁️ Deployment

### Backend → Vercel

1. Push the repo to GitHub (already done)
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Set **Root Directory** to `backend`
4. Add Environment Variable: `DATABASE_URL` = your Supabase connection string
5. Deploy — Vercel uses `vercel.json` to route all requests to FastAPI

### Frontend → Netlify

1. Go to [netlify.com](https://netlify.com) → New Site from Git
2. Set **Base directory** to `frontend`
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add Environment Variable: `VITE_API_URL` = your Vercel backend URL (e.g. `https://your-app.vercel.app`)
6. Deploy — `netlify.toml` handles SPA routing

### After Deploying Both:
- Update `VITE_API_URL` in Netlify to your Vercel URL
- Update the CORS `allow_origins` in `backend/main.py` to include your Netlify domain

---

## 🗃️ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/companies/` | List all companies |
| GET | `/companies/{id}` | Get one company |
| POST | `/companies/` | Create company |
| DELETE | `/companies/{id}` | Delete company |
| GET | `/savings/` | List savings entries |
| POST | `/savings/` | Add savings entry |
| DELETE | `/savings/{id}` | Delete savings entry |
| GET | `/economy/` | List bank accounts |
| POST | `/economy/` | Add bank account |
| DELETE | `/economy/{id}` | Delete bank account |
| GET | `/documents/` | List documents |
| POST | `/documents/` | Add document |
| PUT | `/documents/{id}` | Update document (inline edit) |
| DELETE | `/documents/{id}` | Delete document |

---

## 🎨 Features

- **Companies** — Card grid with status badges, revenue/investment summary, detail view
- **Savings** — Grouped by category, asset vs liability, net worth summary  
- **Bank** — Balance entries with green/red styling, total deposits vs loans
- **Documents** — Inline-editable table, Google Drive link opener
- Dark theme, responsive sidebar, smooth transitions, Indian Rupee (₹) formatting
