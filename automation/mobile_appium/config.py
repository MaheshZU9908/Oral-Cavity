"""
PathoAI Android Mobile Automation — Appium Configuration
==========================================================
Defines Android desired capabilities, Appium server URLs, package details,
and mobile environment constants for oral cavity diagnostic screening app.
"""
import os
from pathlib import Path

# Base Paths
AUTOMATION_ROOT = Path(__file__).parent.parent
MOBILE_ROOT = Path(__file__).parent
REPORTS_DIR = AUTOMATION_ROOT / "reports" / "Excel"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

# Appium Server
APPIUM_SERVER_URL = os.getenv("APPIUM_SERVER_URL", "http://127.0.0.1:4723")

# Android Device / Emulator Capabilities
ANDROID_PLATFORM_NAME = "Android"
ANDROID_AUTOMATION_NAME = "UiAutomator2"
ANDROID_DEVICE_NAME = os.getenv("ANDROID_DEVICE_NAME", "Pixel_7_API_34")
ANDROID_PLATFORM_VERSION = os.getenv("ANDROID_PLATFORM_VERSION", "14.0")

# App Identification
APP_PACKAGE = "com.pathoai.oralcavity.clinical"
APP_ACTIVITY = "com.pathoai.oralcavity.clinical.MainActivity"
APP_WAIT_ACTIVITY = "com.pathoai.oralcavity.clinical.*"

# Timeouts (seconds)
IMPLICIT_WAIT = int(os.getenv("MOBILE_IMPLICIT_WAIT", "10"))
EXPLICIT_WAIT = int(os.getenv("MOBILE_EXPLICIT_WAIT", "20"))
COMMAND_TIMEOUT = int(os.getenv("MOBILE_COMMAND_TIMEOUT", "60"))

# Default Desired Capabilities Dictionary
DESIRED_CAPABILITIES = {
    "platformName": ANDROID_PLATFORM_NAME,
    "appium:automationName": ANDROID_AUTOMATION_NAME,
    "appium:deviceName": ANDROID_DEVICE_NAME,
    "appium:platformVersion": ANDROID_PLATFORM_VERSION,
    "appium:appPackage": APP_PACKAGE,
    "appium:appActivity": APP_ACTIVITY,
    "appium:appWaitActivity": APP_WAIT_ACTIVITY,
    "appium:newCommandTimeout": COMMAND_TIMEOUT,
    "appium:autoGrantPermissions": True,
    "appium:noReset": False,
    "appium:fullReset": False,
    "appium:uiautomator2ServerInstallTimeout": 60000,
    "appium:adbExecTimeout": 40000,
}
