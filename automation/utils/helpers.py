"""
PathoAI Automation — Screenshot & Logging Utilities
====================================================
"""
import logging
import os
import time
from datetime import datetime
from pathlib import Path

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import SCREENSHOTS_DIR, LOGS_DIR


# ──────────────────────────────────────────────────────────
# LOGGING SETUP
# ──────────────────────────────────────────────────────────
def setup_logger(name: str = "pathoai_tests") -> logging.Logger:
    """Configure and return a logger with file + console handlers."""
    logger = logging.getLogger(name)
    logger.setLevel(logging.DEBUG)

    if logger.handlers:
        return logger

    # Console handler
    console = logging.StreamHandler()
    console.setLevel(logging.INFO)
    console.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        datefmt="%H:%M:%S"
    ))

    # File handler
    log_file = LOGS_DIR / f"test_run_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
    fh = logging.FileHandler(log_file, encoding="utf-8")
    fh.setLevel(logging.DEBUG)
    fh.setFormatter(logging.Formatter(
        "%(asctime)s [%(levelname)s] %(name)s:%(lineno)d — %(message)s"
    ))

    logger.addHandler(console)
    logger.addHandler(fh)
    return logger


# ──────────────────────────────────────────────────────────
# SCREENSHOT UTILITIES
# ──────────────────────────────────────────────────────────
def take_screenshot(driver, test_name: str, step: str = "") -> str:
    """Capture a screenshot and return the file path."""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    clean_name = "".join(c if c.isalnum() or c in "-_" else "_" for c in test_name)
    suffix = f"_{step}" if step else ""
    filename = f"{clean_name}{suffix}_{ts}.png"
    filepath = SCREENSHOTS_DIR / filename

    try:
        driver.save_screenshot(str(filepath))
        return str(filepath)
    except Exception as e:
        logging.warning(f"Screenshot failed for {test_name}: {e}")
        return ""


def take_screenshot_on_failure(driver, test_name: str) -> str:
    """Capture a failure screenshot."""
    return take_screenshot(driver, test_name, step="FAILURE")


# ──────────────────────────────────────────────────────────
# BROWSER CONSOLE LOGS
# ──────────────────────────────────────────────────────────
def get_console_logs(driver) -> list:
    """Retrieve browser console logs."""
    try:
        logs = driver.get_log("browser")
        return logs or []
    except Exception:
        return []


def get_console_errors(driver) -> list:
    """Return only ERROR level console logs."""
    return [l for l in get_console_logs(driver) if l.get("level") in ("SEVERE", "ERROR")]


# ──────────────────────────────────────────────────────────
# TIMING UTILITIES
# ──────────────────────────────────────────────────────────
def measure_page_load_time(driver, url: str) -> float:
    """Navigate to URL and return load time in seconds."""
    start = time.time()
    driver.get(url)
    end = time.time()
    return round(end - start, 3)


def get_navigation_timing(driver) -> dict:
    """Get browser Navigation Timing API metrics."""
    try:
        timing = driver.execute_script("""
            var t = performance.timing;
            return {
                dns: t.domainLookupEnd - t.domainLookupStart,
                tcp: t.connectEnd - t.connectStart,
                ttfb: t.responseStart - t.requestStart,
                domLoad: t.domContentLoadedEventEnd - t.navigationStart,
                pageLoad: t.loadEventEnd - t.navigationStart
            };
        """)
        return timing or {}
    except Exception:
        return {}
