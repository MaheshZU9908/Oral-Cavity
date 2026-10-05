"""
PathoAI Android Mobile Automation — Base Screen & Screen Objects
================================================================
Mobile Page Object Model (POM) representations of the PathoAI Clinical Android application.
"""
import time
from typing import Tuple, List, Optional
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from appium.webdriver.common.appiumby import AppiumBy
from mobile_appium.config import EXPLICIT_WAIT, APP_PACKAGE


class BaseScreen:
    """Base Screen for Android UI Automator interactions."""

    def __init__(self, driver=None):
        self.driver = driver
        self.wait = WebDriverWait(self.driver, EXPLICIT_WAIT) if self.driver else None

    def find_element(self, locator: Tuple[AppiumBy, str]):
        if not self.driver:
            return None
        return self.wait.until(EC.presence_of_element_located(locator))

    def find_visible_element(self, locator: Tuple[AppiumBy, str]):
        if not self.driver:
            return None
        return self.wait.until(EC.visibility_of_element_located(locator))

    def click(self, locator: Tuple[AppiumBy, str]):
        el = self.find_visible_element(locator)
        if el:
            el.click()

    def send_keys(self, locator: Tuple[AppiumBy, str], text: str):
        el = self.find_visible_element(locator)
        if el:
            el.clear()
            el.send_keys(text)

    def get_text(self, locator: Tuple[AppiumBy, str]) -> str:
        el = self.find_visible_element(locator)
        return el.text if el else ""

    def is_displayed(self, locator: Tuple[AppiumBy, str]) -> bool:
        try:
            return bool(self.find_visible_element(locator))
        except Exception:
            return False

    def swipe_down(self):
        """Scroll down on Android screen."""
        if not self.driver:
            return
        size = self.driver.get_window_size()
        start_x = size['width'] // 2
        start_y = int(size['height'] * 0.8)
        end_y = int(size['height'] * 0.2)
        self.driver.swipe(start_x, start_y, start_x, end_y, 800)


class LoginScreen(BaseScreen):
    """PathoAI Android Login Screen."""
    EMAIL_INPUT = (AppiumBy.ID, f"{APP_PACKAGE}:id/et_email")
    PASSWORD_INPUT = (AppiumBy.ID, f"{APP_PACKAGE}:id/et_password")
    SIGN_IN_BTN = (AppiumBy.ID, f"{APP_PACKAGE}:id/btn_login")
    BIOMETRIC_AUTH_BTN = (AppiumBy.ID, f"{APP_PACKAGE}:id/btn_biometric")
    FORGOT_PASSWORD_LINK = (AppiumBy.ID, f"{APP_PACKAGE}:id/tv_forgot_password")
    ERROR_BANNER = (AppiumBy.ID, f"{APP_PACKAGE}:id/tv_error_message")

    def login(self, email: str, password: str):
        self.send_keys(self.EMAIL_INPUT, email)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.click(self.SIGN_IN_BTN)


class DashboardScreen(BaseScreen):
    """PathoAI Android Dashboard Screen."""
    TITLE = (AppiumBy.ID, f"{APP_PACKAGE}:id/tv_dashboard_title")
    SCAN_LESION_CARD = (AppiumBy.ID, f"{APP_PACKAGE}:id/card_scan_lesion")
    PATIENTS_CARD = (AppiumBy.ID, f"{APP_PACKAGE}:id/card_patients")
    RECENT_PREDICTIONS_LIST = (AppiumBy.ID, f"{APP_PACKAGE}:id/rv_recent_scans")
    NAV_SETTINGS = (AppiumBy.ID, f"{APP_PACKAGE}:id/nav_settings")


class CameraScanScreen(BaseScreen):
    """Oral Cavity Lesion Capture Screen."""
    CAMERA_PREVIEW = (AppiumBy.ID, f"{APP_PACKAGE}:id/camera_preview_view")
    SHUTTER_BUTTON = (AppiumBy.ID, f"{APP_PACKAGE}:id/btn_capture_shutter")
    TORCH_TOGGLE = (AppiumBy.ID, f"{APP_PACKAGE}:id/btn_torch_toggle")
    ZOOM_SLIDER = (AppiumBy.ID, f"{APP_PACKAGE}:id/slider_optical_zoom")
    CONFIRM_SCAN_BTN = (AppiumBy.ID, f"{APP_PACKAGE}:id/btn_analyze_lesion")
    ANATOMICAL_SITE_SPINNER = (AppiumBy.ID, f"{APP_PACKAGE}:id/spinner_anatomical_site")


class PatientScreen(BaseScreen):
    """Patient Records Mobile Screen."""
    SEARCH_INPUT = (AppiumBy.ID, f"{APP_PACKAGE}:id/et_search_patient")
    ADD_PATIENT_FAB = (AppiumBy.ID, f"{APP_PACKAGE}:id/fab_add_patient")
    PATIENT_RECYCLER = (AppiumBy.ID, f"{APP_PACKAGE}:id/rv_patient_list")


class ReportScreen(BaseScreen):
    """Diagnostic Report & Risk Classification Screen."""
    RISK_BADGE = (AppiumBy.ID, f"{APP_PACKAGE}:id/badge_risk_category")
    CONFIDENCE_SCORE = (AppiumBy.ID, f"{APP_PACKAGE}:id/tv_confidence_score")
    HEATMAP_OVERLAY = (AppiumBy.ID, f"{APP_PACKAGE}:id/iv_mil_heatmap_overlay")
    EXPORT_PDF_BTN = (AppiumBy.ID, f"{APP_PACKAGE}:id/btn_export_clinical_pdf")
