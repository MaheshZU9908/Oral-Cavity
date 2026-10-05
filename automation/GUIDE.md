# PathoAI — Phase 7 CI/CD + Live E2E Testing Guide

## Quick Links
- [Local Execution Guide](#local-execution)
- [CI/CD Guide](#cicd-guide)
- [Repository Configuration](#repository-configuration)
- [Troubleshooting](#troubleshooting)

---

## Repository Configuration

### 1. Enable GitHub Pages

1. Go to your repository: `https://github.com/MaheshZU9908/Oral-Cavity`
2. Click **Settings** → **Pages**
3. Under **Source**, select **GitHub Actions**
4. Click **Save**

### 2. Required Permissions

Go to **Settings → Actions → General**:
- Set **Workflow permissions** to: **Read and write permissions**
- Check: **Allow GitHub Actions to create and approve pull requests**

### 3. Environments Setup

Go to **Settings → Environments**:
- Create environment named: `github-pages`
- No additional protection rules needed for public repos

### 4. Required Secrets (Optional)

Go to **Settings → Secrets and variables → Actions**:

| Secret | Description | Required |
|--------|-------------|----------|
| `VITE_API_URL` | Backend API URL for production | Optional |
| `TEST_EMAIL` | Test doctor email for auth tests | Optional |
| `TEST_PASSWORD` | Test doctor password | Optional |

### 5. Required Variables

| Variable | Value | Description |
|----------|-------|-------------|
| `BASE_URL` | `https://MaheshZU9908.github.io/Oral-Cavity/` | Live deployment URL |

---

## Local Execution Guide

### Prerequisites

```bash
# Python 3.10+
python --version

# Node.js 18+
node --version

# Google Chrome (installed)
# ChromeDriver matching Chrome version
```

### Setup

```bash
# 1. Clone repository
git clone https://github.com/MaheshZU9908/Oral-Cavity
cd Oral-Cavity

# 2. Install Python dependencies
cd automation
pip install -r requirements.txt

# 3. Set BASE_URL (always live GitHub Pages)
# Windows PowerShell:
$env:BASE_URL = "https://MaheshZU9908.github.io/Oral-Cavity/"

# Linux/Mac:
export BASE_URL="https://MaheshZU9908.github.io/Oral-Cavity/"
```

### Run Tests

```bash
cd automation

# Run ALL tests
python -m pytest tests/ -v

# Run specific module
python -m pytest tests/ -v -m authentication
python -m pytest tests/ -v -m navigation
python -m pytest tests/ -v -m ui_validation

# Run with HTML report
python -m pytest tests/ -v --html=reports/HTML/execution-report.html --self-contained-html

# Run in parallel (faster)
python -m pytest tests/ -v -n 4

# Run single test file
python -m pytest tests/test_01_authentication.py -v
```

### Generate Reports

```bash
cd automation

# Generate Excel reports
python utils/excel_generator.py

# Generate HTML dashboard
python utils/report_generator.py

# Generate GitHub summary
python utils/summary_generator.py
```

---

## CI/CD Guide

### Workflow: `.github/workflows/deploy-and-test.yml`

**Triggers:**
- Every `push` to `main`/`master`
- Every `pull_request` to `main`/`master`
- Manual via `workflow_dispatch`

**Pipeline Stages:**

| Stage | Name | Description |
|-------|------|-------------|
| 1 | Checkout | Repository checkout with full history |
| 2 | Install | npm ci for frontend dependencies |
| 3 | Build | Vite build with GitHub Pages base path |
| 4 | Static Analysis | TypeScript type check, bundle size |
| 5 | Deploy | GitHub Pages deployment |
| 6 | Wait | Poll until deployment goes live (max 5 min) |
| 7 | Verify | HTTP 200 check, asset verification |
| 8 | Selenium | Run 400+ E2E tests against live URL |
| 9 | HTML Reports | Generate dashboard.html |
| 10 | Excel Reports | Generate .xlsx reports |
| 11 | Upload | 30-day artifact retention |
| 12 | Summary | Publish to GitHub Actions summary |
| 13 | History | Store historical JSON results |

**Pass/Fail Logic:**
- ✅ PASS: Deployment OK AND pass rate ≥ 95%
- ❌ FAIL: Deployment failed OR >5% critical tests fail

### Manual Trigger with Custom URL

1. Go to **Actions** → **PathoAI — Deploy & Live E2E Tests**
2. Click **Run workflow**
3. Optionally enter a custom `BASE_URL`
4. Click **Run workflow**

---

## Troubleshooting Guide

### Issue: GitHub Pages not deploying

**Symptoms:** Stage 5 fails with "Pages not configured"

**Fix:**
1. Enable GitHub Pages in Settings → Pages
2. Set source to "GitHub Actions"
3. Ensure `permissions: pages: write` in workflow

### Issue: ChromeDriver version mismatch

**Symptoms:** `SessionNotCreatedException: Message: session not created`

**Fix:** The workflow uses system chromium which matches. Locally:
```bash
pip install webdriver-manager
# Then in driver_factory.py, webdriver-manager auto-matches
```

### Issue: Tests fail with "localhost" error

**Symptoms:** `ValueError: FORBIDDEN: BASE_URL cannot point to localhost`

**Fix:** Always set BASE_URL to live GitHub Pages URL:
```bash
export BASE_URL="https://MaheshZU9908.github.io/Oral-Cavity/"
```

### Issue: 404 on GitHub Pages routes

**Symptoms:** Direct URL access returns 404

**Fix:** Add a `404.html` that redirects to index.html (SPA fix):
```bash
# In your build output or public folder
# Copy index.html as 404.html for GitHub Pages SPA routing
```

### Issue: Selenium tests timeout

**Symptoms:** `TimeoutException` on element waits

**Fix:** The tests use 15s explicit waits. If site is slow:
- Increase `EXPLICIT_WAIT` in `config/settings.py`
- Check GitHub Pages CDN propagation (Stage 6 polls 5 min max)

### Issue: Excel generation fails

**Symptoms:** `ModuleNotFoundError: No module named 'openpyxl'`

**Fix:**
```bash
pip install openpyxl==3.1.2
```

### Issue: Token-based auth tests skipped

**Symptoms:** Dashboard/Patients tests redirect to login

**Expected:** This is normal behavior! The app uses real JWT auth. Mock tokens are used for structural testing.

---

## Artifact Downloads

After each workflow run, download from **Actions → [Run] → Artifacts**:

| Artifact | Contents |
|----------|----------|
| `excel-reports` | All 4 Excel files |
| `html-reports` | dashboard.html + execution-report.html |
| `json-results` | execution-results.json |
| `test-screenshots` | Failure screenshots |
| `test-logs` | Execution logs |
| `complete-test-results-N` | Everything bundled |
| `history-run-N` | Historical JSON + summary |

Retention: **30 days**

---

## Test Count Summary

| Category | Test IDs | Count |
|----------|----------|-------|
| Authentication | TC-AUTH-001 to 040 | 40 |
| Authorization | TC-AUTHZ-001 to 040 | 40 |
| Navigation | TC-NAV-001 to 030 | 30 |
| UI Validation | TC-UI-001 to 050 | 50 |
| Forms | TC-FORM-001 to 050 | 50 |
| CRUD Operations | TC-CRUD-001 to 050 | 50 |
| Input Validation | TC-INPUT-001 to 040 | 40 |
| Error Handling | TC-ERR-001 to 020 | 20 |
| Session Management | TC-SESS-001 to 020 | 20 |
| File Upload | TC-FILE-001 to 020 | 20 |
| Accessibility | TC-ACC-001 to 020 | 20 |
| Responsive Design | TC-RESP-001 to 020 | 20 |
| Performance Smoke | TC-PERF-001 to 020 | 20 |
| Regression | TC-REG-001 to 050 | 50 |
| **TOTAL** | | **470+** |
