"""
PathoAI Selenium Automation Framework — Configuration Settings
=============================================================
All configuration is driven from environment variables.
Hardcoded URLs are FORBIDDEN.
"""
import os
from pathlib import Path

# ──────────────────────────────────────────────────────────
# BASE DIRECTORY
# ──────────────────────────────────────────────────────────
AUTOMATION_ROOT = Path(__file__).parent.parent.absolute()

# ──────────────────────────────────────────────────────────
# DEPLOYMENT TARGET — ALWAYS GitHub Pages, NEVER localhost
# ──────────────────────────────────────────────────────────
BASE_URL = os.environ.get(
    "BASE_URL",
    "https://MaheshZU9908.github.io/Oral-Cavity/"
).rstrip("/") + "/"

# Validate: never allow localhost
if "localhost" in BASE_URL or "127.0.0.1" in BASE_URL:
    raise ValueError(
        f"FORBIDDEN: BASE_URL cannot point to localhost. Got: {BASE_URL}\n"
        "Set BASE_URL to the live GitHub Pages URL."
    )

# ──────────────────────────────────────────────────────────
# APPLICATION ROUTES
# ──────────────────────────────────────────────────────────
ROUTES = {
    "home":             BASE_URL,
    "login":            BASE_URL + "login",
    "register":         BASE_URL + "register",
    "dashboard":        BASE_URL + "dashboard",
    "patients":         BASE_URL + "patients",
    "new_prediction":   BASE_URL + "predictions/new",
    "prediction_history": BASE_URL + "predictions/history",
    "reports":          BASE_URL + "reports",
    "settings":         BASE_URL + "settings",
    "doctor_profile":   BASE_URL + "profile",
}

# ──────────────────────────────────────────────────────────
# BROWSER SETTINGS
# ──────────────────────────────────────────────────────────
HEADLESS       = os.environ.get("HEADLESS", "true").lower() == "true"
CHROME_BINARY  = os.environ.get("CHROME_BINARY", "/usr/bin/chromium-browser")
CHROMEDRIVER   = os.environ.get("CHROMEDRIVER_PATH", "/usr/bin/chromedriver")
WINDOW_WIDTH   = int(os.environ.get("WINDOW_WIDTH", "1920"))
WINDOW_HEIGHT  = int(os.environ.get("WINDOW_HEIGHT", "1080"))

# ──────────────────────────────────────────────────────────
# TIMEOUTS (seconds)
# ──────────────────────────────────────────────────────────
IMPLICIT_WAIT        = 5
EXPLICIT_WAIT        = 15
PAGE_LOAD_TIMEOUT    = 30
SCRIPT_TIMEOUT       = 10
RETRY_COUNT          = 3
RETRY_DELAY          = 2

# ──────────────────────────────────────────────────────────
# TEST DATA — DEMO CREDENTIALS
# ──────────────────────────────────────────────────────────
VALID_EMAIL    = os.environ.get("TEST_EMAIL", "doctor@pathoai.org")
VALID_PASSWORD = os.environ.get("TEST_PASSWORD", "SecureDoc@2024")
INVALID_EMAIL  = "invalid@nowhere.xyz"
INVALID_PASSWORD = "WrongPass123!"
REGISTER_EMAIL = "newdoc_automation@test.com"
REGISTER_PASSWORD = "Automation@2024"

# ──────────────────────────────────────────────────────────
# DIRECTORIES
# ──────────────────────────────────────────────────────────
SCREENSHOTS_DIR = AUTOMATION_ROOT / "screenshots"
LOGS_DIR        = AUTOMATION_ROOT / "logs"
REPORTS_DIR     = AUTOMATION_ROOT / "reports"
EXCEL_DIR       = REPORTS_DIR / "Excel"
HTML_DIR        = REPORTS_DIR / "HTML"
JSON_DIR        = REPORTS_DIR / "JSON"
SUMMARY_DIR     = REPORTS_DIR / "Summary"

# Create directories
for d in [SCREENSHOTS_DIR, LOGS_DIR, EXCEL_DIR, HTML_DIR, JSON_DIR, SUMMARY_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ──────────────────────────────────────────────────────────
# PARALLEL EXECUTION
# ──────────────────────────────────────────────────────────
MAX_WORKERS = int(os.environ.get("MAX_WORKERS", "4"))

# ──────────────────────────────────────────────────────────
# PASS/FAIL THRESHOLD
# ──────────────────────────────────────────────────────────
PASS_THRESHOLD_PCT = 95.0
CRITICAL_FAIL_PCT  = 5.0
