"""
PathoAI Page Objects
====================
Login, Register, Dashboard, Patients, Prediction, Settings, Reports pages.
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from pathlib import Path
import sys
sys.path.insert(0, str(Path(__file__).parent.parent))

from pages.base_page import BasePage
from config.settings import ROUTES


# ══════════════════════════════════════════════════════
# LOGIN PAGE
# ══════════════════════════════════════════════════════
class LoginPage(BasePage):
    URL = ROUTES["login"]

    # Locators
    EMAIL_INPUT    = (By.CSS_SELECTOR, "input[type='email']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    SUBMIT_BTN     = (By.CSS_SELECTOR, "button[type='submit']")
    ERROR_MSG      = (By.CSS_SELECTOR, ".bg-rose-50, [class*='error'], [class*='alert']")
    REMEMBER_CHECK = (By.CSS_SELECTOR, "input[type='checkbox']")
    SHOW_PWD_BTN   = (By.CSS_SELECTOR, "button[aria-label*='password'], button[aria-label*='Password']")
    REGISTER_LINK  = (By.CSS_SELECTOR, "a[href*='register']")
    FORGOT_LINK    = (By.CSS_SELECTOR, "a[href*='forgot']")
    HEADING        = (By.CSS_SELECTOR, "h2, h1")
    CARD           = (By.CSS_SELECTOR, ".bg-white, [class*='card'], [class*='Card']")
    EMAIL_ICON     = (By.CSS_SELECTOR, "[class*='lucide'], svg")
    PAGE_LOGO      = (By.CSS_SELECTOR, "[class*='logo'], [class*='brand'], header svg")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def enter_email(self, email: str):
        self.type_text(self.EMAIL_INPUT, email)
        return self

    def enter_password(self, password: str):
        self.type_text(self.PASSWORD_INPUT, password)
        return self

    def click_submit(self):
        self.click(self.SUBMIT_BTN)
        return self

    def toggle_password_visibility(self):
        self.click(self.SHOW_PWD_BTN)
        return self

    def check_remember_me(self):
        el = self.find_element(self.REMEMBER_CHECK)
        if not el.is_selected():
            el.click()
        return self

    def uncheck_remember_me(self):
        el = self.find_element(self.REMEMBER_CHECK)
        if el.is_selected():
            el.click()
        return self

    def login(self, email: str, password: str):
        self.open()
        self.enter_email(email)
        self.enter_password(password)
        self.click_submit()
        return self

    def get_error_text(self) -> str:
        return self.get_text(self.ERROR_MSG)

    def is_error_visible(self) -> bool:
        return self.is_visible(self.ERROR_MSG, timeout=5)

    def click_register_link(self):
        self.click(self.REGISTER_LINK)

    def click_forgot_password(self):
        self.click(self.FORGOT_LINK)


# ══════════════════════════════════════════════════════
# REGISTER PAGE
# ══════════════════════════════════════════════════════
class RegisterPage(BasePage):
    URL = ROUTES["register"]

    FIRST_NAME     = (By.CSS_SELECTOR, "input[name='firstName'], input[placeholder*='first']")
    LAST_NAME      = (By.CSS_SELECTOR, "input[name='lastName'], input[placeholder*='last']")
    EMAIL_INPUT    = (By.CSS_SELECTOR, "input[type='email']")
    SPECIALTY      = (By.CSS_SELECTOR, "input[name='specialty'], select[name='specialty']")
    LICENSE        = (By.CSS_SELECTOR, "input[name='licenseNumber'], input[placeholder*='license']")
    INSTITUTION    = (By.CSS_SELECTOR, "input[name='institution'], input[placeholder*='hospital']")
    PASSWORD_INPUT = (By.CSS_SELECTOR, "input[type='password']")
    CONFIRM_PWD    = (By.CSS_SELECTOR, "input[name='confirmPassword'], input[placeholder*='confirm']")
    SUBMIT_BTN     = (By.CSS_SELECTOR, "button[type='submit']")
    LOGIN_LINK     = (By.CSS_SELECTOR, "a[href*='login']")
    HEADING        = (By.CSS_SELECTOR, "h1, h2")
    ERROR_MSG      = (By.CSS_SELECTOR, ".bg-rose-50, [class*='error']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def fill_registration_form(self, data: dict):
        fields = [
            (self.FIRST_NAME, data.get("firstName", "Dr. Test")),
            (self.LAST_NAME, data.get("lastName", "Automation")),
            (self.EMAIL_INPUT, data.get("email", "test@pathoai.com")),
            (self.SPECIALTY, data.get("specialty", "Pathology")),
            (self.LICENSE, data.get("licenseNumber", "LIC-AUTO-001")),
            (self.INSTITUTION, data.get("institution", "Test Hospital")),
        ]
        for locator, value in fields:
            try:
                self.type_text(locator, value)
            except Exception:
                pass  # Field may not exist

        passwords = self.find_elements((By.CSS_SELECTOR, "input[type='password']"))
        if len(passwords) >= 1:
            passwords[0].clear()
            passwords[0].send_keys(data.get("password", "Automation@2024"))
        if len(passwords) >= 2:
            passwords[1].clear()
            passwords[1].send_keys(data.get("password", "Automation@2024"))
        return self

    def submit(self):
        self.click(self.SUBMIT_BTN)
        return self

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)


# ══════════════════════════════════════════════════════
# DASHBOARD PAGE
# ══════════════════════════════════════════════════════
class DashboardPage(BasePage):
    URL = ROUTES["dashboard"]

    HEADING         = (By.CSS_SELECTOR, "h1, h2")
    KPI_CARDS       = (By.CSS_SELECTOR, "[class*='stat'], [class*='kpi'], [class*='metric'], [class*='card']")
    NAV_LINKS       = (By.CSS_SELECTOR, "nav a, [class*='nav'] a, aside a")
    PATIENT_LINK    = (By.CSS_SELECTOR, "a[href*='patient'], a[href*='Patient']")
    PREDICTION_LINK = (By.CSS_SELECTOR, "a[href*='predict'], a[href*='Predict']")
    REPORT_LINK     = (By.CSS_SELECTOR, "a[href*='report'], a[href*='Report']")
    SETTINGS_LINK   = (By.CSS_SELECTOR, "a[href*='setting'], a[href*='Setting']")
    LOGOUT_BTN      = (By.CSS_SELECTOR, "button[class*='logout'], [data-testid='logout']")
    RISK_BREAKDOWN  = (By.CSS_SELECTOR, "[class*='risk'], [class*='Risk']")
    ACTIVITY_FEED   = (By.CSS_SELECTOR, "[class*='activity'], [class*='recent']")
    DISCLAIMER      = (By.CSS_SELECTOR, "[class*='disclaimer'], [class*='clinical']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)

    def get_kpi_count(self) -> int:
        return len(self.find_elements(self.KPI_CARDS))

    def get_nav_link_count(self) -> int:
        return len(self.find_elements(self.NAV_LINKS))

    def navigate_to_patients(self):
        self.click(self.PATIENT_LINK)

    def navigate_to_predictions(self):
        self.click(self.PREDICTION_LINK)

    def navigate_to_reports(self):
        self.click(self.REPORT_LINK)

    def navigate_to_settings(self):
        self.click(self.SETTINGS_LINK)

    def is_authenticated(self) -> bool:
        """Check if the dashboard is accessible (user is authenticated)."""
        url = self.get_current_url()
        return "login" not in url and "register" not in url


# ══════════════════════════════════════════════════════
# PATIENTS PAGE
# ══════════════════════════════════════════════════════
class PatientsPage(BasePage):
    URL = ROUTES["patients"]

    HEADING      = (By.CSS_SELECTOR, "h1, h2")
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[type='search'], input[placeholder*='search'], input[placeholder*='Search']")
    PATIENT_ROWS = (By.CSS_SELECTOR, "table tbody tr, [class*='patient-row'], [class*='PatientRow']")
    ADD_BTN      = (By.CSS_SELECTOR, "button[class*='add'], button[class*='new'], button[class*='Add']")
    FILTER_BTN   = (By.CSS_SELECTOR, "button[class*='filter'], [class*='Filter']")
    GENDER_FILTER= (By.CSS_SELECTOR, "select[name*='gender'], [class*='gender']")
    PAGINATION   = (By.CSS_SELECTOR, "[class*='pagination'], [class*='Pagination']")
    NEXT_PAGE    = (By.CSS_SELECTOR, "[aria-label*='next'], [class*='next']")
    PREV_PAGE    = (By.CSS_SELECTOR, "[aria-label*='prev'], [class*='prev']")
    EMPTY_STATE  = (By.CSS_SELECTOR, "[class*='empty'], [class*='Empty']")
    TABLE_HEADER = (By.CSS_SELECTOR, "thead th, [class*='table-header']")
    SORT_BTNS    = (By.CSS_SELECTOR, "th button, [class*='sort']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def search_patient(self, query: str):
        self.type_text(self.SEARCH_INPUT, query)
        return self

    def get_patient_count(self) -> int:
        return len(self.find_elements(self.PATIENT_ROWS))

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)

    def click_add_patient(self):
        self.click(self.ADD_BTN)

    def is_search_present(self) -> bool:
        return self.is_visible(self.SEARCH_INPUT)

    def is_pagination_present(self) -> bool:
        return self.is_present(self.PAGINATION)


# ══════════════════════════════════════════════════════
# NEW PREDICTION PAGE
# ══════════════════════════════════════════════════════
class NewPredictionPage(BasePage):
    URL = ROUTES["new_prediction"]

    HEADING       = (By.CSS_SELECTOR, "h1, h2")
    PATIENT_SELECT= (By.CSS_SELECTOR, "select[name*='patient'], input[placeholder*='patient']")
    FILE_UPLOAD   = (By.CSS_SELECTOR, "input[type='file']")
    SUBMIT_BTN    = (By.CSS_SELECTOR, "button[type='submit']")
    STEP_INDICATOR= (By.CSS_SELECTOR, "[class*='step'], [class*='Step']")
    DISCLAIMER    = (By.CSS_SELECTOR, "[class*='disclaimer'], [class*='warning']")
    UPLOAD_AREA   = (By.CSS_SELECTOR, "[class*='upload'], [class*='dropzone']")
    PREVIEW_IMG   = (By.CSS_SELECTOR, "img[class*='preview'], [class*='Preview']")
    PROGRESS_BAR  = (By.CSS_SELECTOR, "[class*='progress'], [role='progressbar']")
    RISK_RESULT   = (By.CSS_SELECTOR, "[class*='risk'], [class*='score']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)

    def is_file_input_present(self) -> bool:
        return self.is_present(self.FILE_UPLOAD)

    def is_disclaimer_present(self) -> bool:
        return self.is_visible(self.DISCLAIMER)

    def get_step_count(self) -> int:
        return len(self.find_elements(self.STEP_INDICATOR))


# ══════════════════════════════════════════════════════
# PREDICTION HISTORY PAGE
# ══════════════════════════════════════════════════════
class PredictionHistoryPage(BasePage):
    URL = ROUTES["prediction_history"]

    HEADING      = (By.CSS_SELECTOR, "h1, h2")
    HISTORY_ROWS = (By.CSS_SELECTOR, "table tbody tr, [class*='history-item']")
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[type='search'], input[placeholder*='search']")
    DATE_FILTER  = (By.CSS_SELECTOR, "input[type='date'], [class*='date']")
    PAGINATION   = (By.CSS_SELECTOR, "[class*='pagination']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)

    def get_history_count(self) -> int:
        return len(self.find_elements(self.HISTORY_ROWS))


# ══════════════════════════════════════════════════════
# REPORTS PAGE
# ══════════════════════════════════════════════════════
class ReportsPage(BasePage):
    URL = ROUTES["reports"]

    HEADING       = (By.CSS_SELECTOR, "h1, h2")
    REPORT_CARDS  = (By.CSS_SELECTOR, "[class*='report'], [class*='Report']")
    EXPORT_BTNS   = (By.CSS_SELECTOR, "button[class*='export'], button[class*='Export']")
    DATE_RANGE    = (By.CSS_SELECTOR, "input[type='date']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)


# ══════════════════════════════════════════════════════
# SETTINGS PAGE
# ══════════════════════════════════════════════════════
class SettingsPage(BasePage):
    URL = ROUTES["settings"]

    HEADING       = (By.CSS_SELECTOR, "h1, h2")
    SAVE_BTN      = (By.CSS_SELECTOR, "button[type='submit'], button[class*='save']")
    INPUT_FIELDS  = (By.CSS_SELECTOR, "input:not([type='hidden']):not([type='checkbox'])")
    TOGGLE_BTNS   = (By.CSS_SELECTOR, "input[type='checkbox'], button[role='switch']")

    def open(self):
        self.navigate_to(self.URL)
        return self

    def get_heading(self) -> str:
        return self.get_text(self.HEADING)

    def get_input_count(self) -> int:
        return len(self.find_elements(self.INPUT_FIELDS))
