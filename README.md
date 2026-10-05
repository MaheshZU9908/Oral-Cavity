# Clinical AI Decision-Support System: Nodal Metastasis Risk Prediction (MIL)

A production-structured, end-to-end clinical AI decision-support web application for **Nodal Metastasis Risk Prediction from Biopsy Histology Images using Multi-Instance Learning (MIL)**.

---

## 🔬 Architecture Overview

```
Frontend (React 18 + TypeScript + Vite + Tailwind CSS)
   │
   ▼ (REST API + JWT / Secure Cookies)
Backend (Node.js + Express + TypeScript)
   ├── Authentication & Authorization (Bcrypt + JWT)
   ├── Patient Management (Doctor Scoped)
   ├── Biopsy Specimen & Upload Handler (Multer)
   ├── InferenceService Abstraction (Demo MIL vs Real Model Microservice)
   └── Persistence Engine (@supabase/supabase-js -> Supabase PostgreSQL & Storage)
```

---

## 🚀 Key Features

1. **Enterprise Clinical UX**:
   - Clean slate/white design, WCAG-accessible risk badges (LOW / MODERATE / HIGH) with icon and score clarity.
   - Dynamic real-time Dashboard with KPI metrics, risk breakdown progress bars, and recent activity feeds.
2. **Doctor Authentication & Scoping**:
   - Bcrypt password hashing, JWT session verification, profile management, and password update.
   - All patient charts, biopsy slides, and prediction histories are strictly isolated to the authenticated physician.
3. **Patient Clinical Registry**:
   - Searchable, filterable (by gender/diagnosis), sortable, and paginated medical records.
   - Interactive patient chart with longitudinal prediction history.
4. **13-Step Prediction Workflow**:
   - Patient selection / inline enrollment -> Biopsy slide upload (JPEG, PNG, TIFF, WebP, SVS) -> File validation & preview -> Processing animation with patch aggregation steps -> Live risk score calculation -> Instant printable report.
5. **Multi-Instance Learning (MIL) Isolation**:
   - Isolated inference interface with `AI_MODE=demo` (deterministic bag-level attention simulation) and `AI_MODE=real` (connects to Python FastAPI MIL microservice).
   - Prominent mandatory clinical disclaimer on all screens and print outputs.

---

## 🗄️ Database Setup (Supabase PostgreSQL)

1. Create a project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Paste and run the schema file located at [`supabase/schema.sql`](supabase/schema.sql).
4. Copy your **Project URL** and **anon / service_role key** into `backend/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

---

## ⚡ One-Command Unified Startup (Recommended)

Start the entire PathoAI application (Frontend + Backend + AI Service) from the root project folder with a single command:

```bash
npm run dev:all
```

### 📋 Prerequisites

Before running the single startup command, ensure the following are installed and configured:

1. **Node.js & npm**: Node.js 18+ and npm 9+
2. **Python**: Python 3.10+ with `pip`
3. **Dependencies Installed**:
   ```bash
   npm run install:all
   ```
   *Or install manually:*
   - Root: `npm install`
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
   - AI Service: `pip install -r ai_service/requirements.txt`
4. **Environment Variables**:
   - Verify `backend/.env` exists and contains your Supabase credentials (`SUPABASE_URL`, `SUPABASE_ANON_KEY`), `AI_MODE=real`, and `AI_SERVICE_URL=http://localhost:8000`.
   - Verify `frontend/.env` exists and specifies `VITE_API_URL=http://localhost:5000/api`.

### 🌐 Service Port Mapping

| Service | Port | Local URL | Health Endpoint |
|---|---|---|---|
| **Frontend Web App** (Vite + React) | `5173` | `http://localhost:5173` | `http://localhost:5173` |
| **Backend REST API** (Express + TypeScript) | `5000` | `http://localhost:5000` | `http://localhost:5000/api/health` |
| **AI Inference Service** (FastAPI + MIL) | `8000` | `http://localhost:8000` | `http://localhost:8000/health` |

### 🛡️ Error Handling & Failure Visibility

The unified startup uses `concurrently` with distinct colored prefixes:
- `[BACKEND]` (Cyan)
- `[FRONTEND]` (Green)
- `[AI_SERVICE]` (Magenta)

If any service encounters an error or crashes, the runner immediately indicates which service exited and gracefully terminates the other services.

---

## ⚙️ Manual Multi-Terminal Startup (Alternative)

If you prefer starting each service independently in dedicated terminal windows:

### 1. Start the AI Inference Service (Port 8000)
```bash
npm run dev:ai
# Or: python -m uvicorn app:app --app-dir ai_service --host 0.0.0.0 --port 8000
```

### 2. Start the Backend API (Port 5000)
```bash
npm run dev:backend
# Or: cd backend && npm run dev
```

### 3. Start the Frontend Web App (Port 5173)
```bash
npm run dev:frontend
# Or: cd frontend && npm run dev
```

---

## 🧪 Running Automated Tests

Run backend unit and integration tests:
```bash
cd backend
npm test
```
