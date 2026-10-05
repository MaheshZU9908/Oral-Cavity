"""
PathoAI Automation — Base Page Object
======================================
All Page Objects inherit from this class.
"""
import logging
import time
from pathlib import Path

from selenium.common.exceptions import (
    NoSuchElementException, TimeoutException, ElementClickInterceptedException,
    StaleElementReferenceException
)
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

import sys
sys.path.insert(0, str(Path(__file__).parent.parent))
from config.settings import EXPLICIT_WAIT, RETRY_COUNT, RETRY_DELAY
from utils.helpers import take_screenshot, get_console_logs

logger = logging.getLogger("pathoai_tests")


class BasePage:
    """Base Page Object — all page classes inherit from this."""

    def __init__(self, driver: WebDriver):
        self.driver = driver
        self.wait = WebDriverWait(driver, EXPLICIT_WAIT)

    # ── Navigation ──
    def navigate_to(self, url: str) -> None:
        logger.info(f"Navigating to: {url}")
        self.driver.get(url)

    def get_current_url(self) -> str:
        return self.driver.current_url

    def get_title(self) -> str:
        return self.driver.title

    def refresh(self) -> None:
        self.driver.refresh()

    def go_back(self) -> None:
        self.driver.back()

    # ── Element Interaction ──
    def find_element(self, locator: tuple):
        return self.wait.until(EC.presence_of_element_located(locator))

    def find_elements(self, locator: tuple) -> list:
        try:
            return self.driver.find_elements(*locator)
        except Exception:
            return []

    def click(self, locator: tuple, retries: int = RETRY_COUNT) -> None:
        for attempt in range(retries):
            try:
                el = self.wait.until(EC.element_to_be_clickable(locator))
                el.click()
                return
            except ElementClickInterceptedException:
                self.driver.execute_script(
                    "arguments[0].click();",
                    self.driver.find_element(*locator)
                )
                return
            except (StaleElementReferenceException, TimeoutException) as e:
                if attempt == retries - 1:
                    raise
                time.sleep(RETRY_DELAY)

    def type_text(self, locator: tuple, text: str, clear: bool = True) -> None:
        el = self.wait.until(EC.visibility_of_element_located(locator))
        if clear:
            el.clear()
        el.send_keys(text)

    def get_text(self, locator: tuple) -> str:
        try:
            return self.find_element(locator).text.strip()
        except Exception:
            return ""

    def get_attribute(self, locator: tuple, attr: str) -> str:
        try:
            return self.find_element(locator).get_attribute(attr) or ""
        except Exception:
            return ""

    def is_visible(self, locator: tuple, timeout: int = 5) -> bool:
        try:
            WebDriverWait(self.driver, timeout).until(
                EC.visibility_of_element_located(locator)
            )
            return True
        except (TimeoutException, NoSuchElementException):
            return False

    def is_present(self, locator: tuple) -> bool:
        return len(self.driver.find_elements(*locator)) > 0

    def wait_for_visible(self, locator: tuple, timeout: int = None):
        t = timeout or EXPLICIT_WAIT
        return WebDriverWait(self.driver, t).until(
            EC.visibility_of_element_located(locator)
        )

    def wait_for_url_contains(self, text: str, timeout: int = None) -> bool:
        t = timeout or EXPLICIT_WAIT
        try:
            WebDriverWait(self.driver, t).until(EC.url_contains(text))
            return True
        except TimeoutException:
            return False

    def wait_for_text(self, locator: tuple, text: str, timeout: int = None) -> bool:
        t = timeout or EXPLICIT_WAIT
        try:
            WebDriverWait(self.driver, t).until(
                EC.text_to_be_present_in_element(locator, text)
            )
            return True
        except TimeoutException:
            return False

    # ── Scroll ──
    def scroll_to_element(self, locator: tuple) -> None:
        el = self.find_element(locator)
        self.driver.execute_script("arguments[0].scrollIntoView(true);", el)
        time.sleep(0.3)

    def scroll_to_bottom(self) -> None:
        self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")

    def scroll_to_top(self) -> None:
        self.driver.execute_script("window.scrollTo(0, 0);")

    # ── JavaScript ──
    def execute_js(self, script: str, *args):
        return self.driver.execute_script(script, *args)

    def get_local_storage(self, key: str) -> str:
        return self.execute_js(f"return localStorage.getItem('{key}');") or ""

    def clear_local_storage(self) -> None:
        self.execute_js("localStorage.clear();")

    def set_local_storage(self, key: str, value: str) -> None:
        self.execute_js(f"localStorage.setItem('{key}', '{value}');")

    # ── Screenshot ──
    def screenshot(self, name: str, step: str = "") -> str:
        return take_screenshot(self.driver, name, step)

    # ── Assertions ──
    def assert_url_contains(self, fragment: str) -> None:
        url = self.get_current_url()
        assert fragment in url, f"URL '{url}' does not contain '{fragment}'"

    def assert_text_present(self, locator: tuple, expected: str) -> None:
        actual = self.get_text(locator)
        assert expected.lower() in actual.lower(), \
            f"Expected '{expected}' in text, got: '{actual}'"

    def assert_element_visible(self, locator: tuple) -> None:
        assert self.is_visible(locator), f"Element {locator} is not visible"

    def assert_element_not_visible(self, locator: tuple) -> None:
        assert not self.is_visible(locator), f"Element {locator} should not be visible"
