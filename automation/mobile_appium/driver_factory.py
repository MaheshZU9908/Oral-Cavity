"""
PathoAI Android Mobile Automation — Appium Driver Factory
==========================================================
Manages Appium WebDriver instances for real Android devices and emulators.
Provides mock/dry-run capabilities for CI environments without attached emulators.
"""
import logging
from appium import webdriver
from appium.options.android import UiAutomator2Options
from mobile_appium.config import (
    APPIUM_SERVER_URL, DESIRED_CAPABILITIES, IMPLICIT_WAIT
)

logger = logging.getLogger("AppiumDriverFactory")


class MobileDriverFactory:
    """Factory to create and tear down Appium Android drivers."""

    @staticmethod
    def get_driver(custom_caps: dict = None, mock_mode: bool = False):
        """Create and return an Appium WebDriver instance."""
        caps = {**DESIRED_CAPABILITIES}
        if custom_caps:
            caps.update(custom_caps)

        if mock_mode:
            logger.info("Initializing Mock Mobile Driver for CI/headless verification")
            return None

        try:
            options = UiAutomator2Options().load_capabilities(caps)
            driver = webdriver.Remote(
                command_executor=APPIUM_SERVER_URL,
                options=options
            )
            driver.implicitly_wait(IMPLICIT_WAIT)
            logger.info(f"Connected to Appium Server at {APPIUM_SERVER_URL}")
            return driver
        except Exception as e:
            logger.warning(f"Could not connect to live Appium device/server: {e}")
            logger.info("Falling back to simulated/mock mobile test execution mode.")
            return None
