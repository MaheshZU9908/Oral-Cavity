"""
PathoAI Selenium Automation — Driver Factory
============================================
Creates headless Chrome WebDriver configured for GitHub Actions.
"""
import logging
import os
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import (
    HEADLESS, CHROME_BINARY, CHROMEDRIVER, IMPLICIT_WAIT,
    PAGE_LOAD_TIMEOUT, SCRIPT_TIMEOUT, WINDOW_WIDTH, WINDOW_HEIGHT
)

logger = logging.getLogger(__name__)


def create_driver(headless: bool = None) -> webdriver.Chrome:
    """
    Create and return a configured Chrome WebDriver.
    Supports both local and CI (GitHub Actions) environments.
    """
    _headless = headless if headless is not None else HEADLESS

    options = Options()

    if _headless:
        options.add_argument("--headless=new")

    # Required for CI / Docker / GitHub Actions
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-infobars")
    options.add_argument("--disable-browser-side-navigation")
    options.add_argument("--dns-prefetch-disable")
    options.add_argument(f"--window-size={WINDOW_WIDTH},{WINDOW_HEIGHT}")
    options.add_argument("--start-maximized")
    options.add_argument("--remote-debugging-port=9222")

    # Logging preferences
    options.set_capability("goog:loggingPrefs", {"browser": "ALL", "performance": "ALL"})

    # Disable images for speed (optional — comment out to test image loading)
    prefs = {
        "profile.managed_default_content_settings.images": 2,  # Block images for speed
        "profile.default_content_setting_values.notifications": 2,
    }
    options.add_experimental_option("prefs", prefs)
    options.add_experimental_option("excludeSwitches", ["enable-automation"])
    options.add_experimental_option("useAutomationExtension", False)

    # Set binary path if specified or present
    if CHROME_BINARY and Path(CHROME_BINARY).exists():
        options.binary_location = CHROME_BINARY
        logger.info(f"Using Chrome binary: {CHROME_BINARY}")
    elif Path("/usr/bin/google-chrome").exists():
        options.binary_location = "/usr/bin/google-chrome"
        logger.info("Using system Google Chrome: /usr/bin/google-chrome")
    elif Path("/usr/bin/chromium-browser").exists():
        options.binary_location = "/usr/bin/chromium-browser"
        logger.info("Using system Chromium: /usr/bin/chromium-browser")

    # Create service
    service = None
    chromedriver_path = CHROMEDRIVER
    if chromedriver_path and Path(chromedriver_path).exists():
        service = Service(executable_path=chromedriver_path)
        logger.info(f"Using ChromeDriver: {chromedriver_path}")
    else:
        service = Service()

    driver = webdriver.Chrome(service=service, options=options)
    driver.implicitly_wait(IMPLICIT_WAIT)
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    driver.set_script_timeout(SCRIPT_TIMEOUT)

    logger.info(f"WebDriver created — Window: {WINDOW_WIDTH}x{WINDOW_HEIGHT}, Headless: {_headless}")
    return driver


def quit_driver(driver: webdriver.Chrome) -> None:
    """Safely quit the WebDriver."""
    if driver:
        try:
            driver.quit()
            logger.info("WebDriver quit successfully.")
        except Exception as e:
            logger.warning(f"Error quitting driver: {e}")
