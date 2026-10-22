from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
SOURCE = (ROOT / "apps/octavianos/src/main.jsx").read_text(encoding="utf-8")
STYLE = (ROOT / "apps/octavianos/src/style.css").read_text(encoding="utf-8")
AURORA = (ROOT / "apps/octavianos/aurora/index.html").read_text(encoding="utf-8")
MARINE = (ROOT / "apps/octavianos/marine/index.html").read_text(encoding="utf-8")

class ProviderAvailabilityContract(unittest.TestCase):
    def test_checks_same_origin_web_providers(self):
        self.assertIn('method: "HEAD"', SOURCE)
        self.assertIn('url.origin !== window.location.origin', SOURCE)
        self.assertIn('response.ok ? "available" : "unavailable"', SOURCE)

    def test_launch_is_blocked_until_preview_is_verified(self):
        self.assertIn('aria-disabled={state!=="available"}', SOURCE)
        self.assertIn('event.preventDefault()', SOURCE)
        self.assertIn('Checking web provider', SOURCE)
        self.assertIn('Web preview unavailable', SOURCE)

    def test_native_runtime_is_not_falsely_claimed(self):
        self.assertIn('native provider not connected', SOURCE)
        self.assertIn('Native Koronos launch is not connected', SOURCE)

    def test_aurora_and_marine_check_actual_web_routes(self):
        for page in (AURORA, MARINE):
            self.assertIn('id="provider-status"', page)
            self.assertIn("method:'HEAD'", page)
            self.assertIn("event.preventDefault()", page)
            self.assertIn("native Koronos disconnected", page)
            self.assertIn("aria-disabled", page)

    def test_pending_state_is_visually_distinct(self):
        self.assertIn('.app-card-pending', STYLE)
        self.assertIn('cursor:not-allowed', STYLE)

if __name__ == "__main__":
    unittest.main()
