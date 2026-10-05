"""
PathoAI Mobile Appium — Pytest Fixtures
=========================================
Fixtures for Android mobile E2E, load, unit, and validation suites.
Gracefully handles environments with and without active Appium servers.
"""
import pytest
from mobile_appium.driver_factory import MobileDriverFactory
from mobile_appium.pages.screens import (
    LoginScreen, DashboardScreen, CameraScanScreen, PatientScreen, ReportScreen
)


@pytest.fixture(scope="session")
def mobile_driver():
    """Initializes Appium driver or returns mock driver if Appium server is not running."""
    driver = MobileDriverFactory.get_driver()
    yield driver
    if driver:
        driver.quit()


@pytest.fixture
def login_screen(mobile_driver):
    return LoginScreen(mobile_driver)


@pytest.fixture
def dashboard_screen(mobile_driver):
    return DashboardScreen(mobile_driver)


@pytest.fixture
def camera_screen(mobile_driver):
    return CameraScanScreen(mobile_driver)


@pytest.fixture
def patient_screen(mobile_driver):
    return PatientScreen(mobile_driver)


@pytest.fixture
def report_screen(mobile_driver):
    return ReportScreen(mobile_driver)
