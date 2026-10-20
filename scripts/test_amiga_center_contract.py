import pathlib
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[1]
APP = (ROOT / "apps/nlp-amiga/app.js").read_text(encoding="utf-8")
ADAPTER = (ROOT / "apps/nlp-amiga/emulator_adapter.js").read_text(encoding="utf-8")


class AmigaCenterRuntimeContractTests(unittest.TestCase):
    def test_external_fallback_is_not_reported_as_local_runtime(self):
        self.assertIn("fallback-opened", ADAPTER)
        self.assertIn("popup-blocked", ADAPTER)
        self.assertIn("vAmigaWeb opened in a new tab", APP)
        self.assertNotIn("started?'Running':'Integration Ready'", APP)

    def test_pause_and_reset_require_local_runtime(self):
        self.assertIn("Pause unavailable: no running local SAE runtime", ADAPTER)
        self.assertIn("Reset unavailable: no local SAE runtime", ADAPTER)
        self.assertIn("Pause is unavailable without the local SAE runtime", APP)
        self.assertIn("Reset is unavailable without the local SAE runtime", APP)

    def test_rom_is_required_for_local_start(self):
        self.assertIn("Select a Kickstart ROM before starting.", ADAPTER)
        self.assertIn("this.cfg.memory?.rom?.size", ADAPTER)

    def test_hardfile_limitation_is_explicit(self):
        self.assertIn("hardfile mapping is not implemented in this adapter yet", ADAPTER)

    def test_selected_media_is_not_claimed_to_transfer_to_external_tab(self):
        self.assertIn("not passed to the external vAmigaWeb tab", ADAPTER)
        self.assertIn("external to this page", APP)


if __name__ == "__main__":
    unittest.main()
