"""
conftest.py — Pytest fixtures for PathoAI E2E Selenium Tests
=============================================================
"""
import json
import logging
import os
import time
from datetime import datetime
from pathlib import Path

import pytest

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.settings import BASE_URL, SCREENSHOTS_DIR, LOGS_DIR, JSON_DIR
from utils.driver_factory import create_driver, quit_driver
from utils.helpers import setup_logger, take_screenshot_on_failure, get_console_errors

# Setup root logger
logger = setup_logger("pathoai_tests")

# ── Session-level execution tracking ──
EXECUTION_RESULTS = {
    "meta": {
        "base_url": BASE_URL,
        "started_at": datetime.now().isoformat(),
        "environment": "GitHub Pages (Live)",
    },
    "summary": {
        "total": 0,
        "passed": 0,
        "failed": 0,
        "skipped": 0,
        "errors": 0,
        "duration": 0.0,
    },
    "tests": []
}

SESSION_START = time.time()


# ── Driver Fixture (function-scoped) ──
@pytest.fixture(scope="function")
def driver():
    """Create a new WebDriver for each test."""
    drv = create_driver()
    logger.info(f"Driver started for test | BASE_URL={BASE_URL}")
    yield drv
    quit_driver(drv)


# ── Authenticated Driver Fixture ──
@pytest.fixture(scope="function")
def auth_driver(driver):
    """Driver with session token injected (bypasses actual login for speed)."""
    from config.settings import VALID_EMAIL, VALID_PASSWORD
    # Navigate first to establish domain
    driver.get(BASE_URL)
    time.sleep(1)
    # Inject a mock token for testing authenticated routes
    driver.execute_script(
        "localStorage.setItem('clinical_ai_token', 'test-mock-token-automation');"
    )
    yield driver


# ── Pages Fixture ──
@pytest.fixture(scope="function")
def login_page(driver):
    from pages.pages import LoginPage
    return LoginPage(driver)


@pytest.fixture(scope="function")
def register_page(driver):
    from pages.pages import RegisterPage
    return RegisterPage(driver)


@pytest.fixture(scope="function")
def dashboard_page(auth_driver):
    from pages.pages import DashboardPage
    return DashboardPage(auth_driver)


@pytest.fixture(scope="function")
def patients_page(auth_driver):
    from pages.pages import PatientsPage
    return PatientsPage(auth_driver)


@pytest.fixture(scope="function")
def new_prediction_page(auth_driver):
    from pages.pages import NewPredictionPage
    return NewPredictionPage(auth_driver)


# ── Test result tracking ──
@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()

    if report.when == "call":
        status = "passed" if report.passed else ("failed" if report.failed else "skipped")

        # Screenshot on failure
        if report.failed:
            try:
                driver_fixture = item.funcargs.get("driver") or item.funcargs.get("auth_driver")
                if driver_fixture:
                    path = take_screenshot_on_failure(driver_fixture, item.name)
                    errors = get_console_errors(driver_fixture)
                    logger.error(f"FAILED: {item.name} | Console errors: {len(errors)}")
            except Exception as e:
                logger.warning(f"Post-failure capture error: {e}")

        # Track results
        test_data = {
            "test_id": item.nodeid,
            "name": item.name,
            "module": item.module.__name__ if hasattr(item, 'module') else "unknown",
            "status": status,
            "duration": round(report.duration, 3),
            "timestamp": datetime.now().isoformat(),
            "failure_reason": str(report.longrepr)[:500] if report.failed else None,
        }
        EXECUTION_RESULTS["tests"].append(test_data)
        EXECUTION_RESULTS["summary"][status] = EXECUTION_RESULTS["summary"].get(status, 0) + 1
        EXECUTION_RESULTS["summary"]["total"] += 1


# ── Session finish: write JSON results ──
def pytest_sessionfinish(session, exitstatus):
    EXECUTION_RESULTS["summary"]["duration"] = round(time.time() - SESSION_START, 2)
    EXECUTION_RESULTS["meta"]["finished_at"] = datetime.now().isoformat()
    EXECUTION_RESULTS["meta"]["exit_status"] = exitstatus

    results_file = JSON_DIR / "execution-results.json"
    try:
        with open(results_file, "w", encoding="utf-8") as f:
            json.dump(EXECUTION_RESULTS, f, indent=2)
        logger.info(f"Results written to: {results_file}")
    except Exception as e:
        logger.error(f"Failed to write results: {e}")
