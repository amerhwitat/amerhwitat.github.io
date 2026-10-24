#!/usr/bin/env python3
"""Static regression checks for the browser-side Unity WebGL launcher."""
from pathlib import Path
import unittest

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "apps" / "webgl-unity"

class WebGLLauncherSmokeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (APP / "index.html").read_text(encoding="utf-8")
        cls.js = (APP / "launcher.js").read_text(encoding="utf-8")
        cls.css = (APP / "launcher.css").read_text(encoding="utf-8")

    def test_launcher_has_accessible_archive_input_and_status(self):
        self.assertIn('id="archive-input"', self.html)
        self.assertIn('aria-live="polite"', self.html)
        self.assertIn('id="drop-zone"', self.html)

    def test_required_unity_payload_paths_are_explicit(self):
        for path in ("webgl.loader.js", "webgl.data.gz", "webgl.framework.js.gz", "webgl.wasm.gz"):
            self.assertIn(path, self.js)

    def test_zip_integrity_and_path_safety_are_enforced(self):
        self.assertIn("crc32(raw) !== crc", self.js)
        self.assertIn('name.split("/").includes("..")', self.js)
        self.assertIn("Encrypted ZIP entries are not supported", self.js)
        self.assertIn("ZIP64 archives are not supported", self.js)

    def test_wasm_and_gzip_payloads_are_checked(self):
        self.assertIn('DecompressionStream("gzip")', self.js)
        self.assertIn("createUnityInstance", self.js)
        self.assertIn('application/wasm', self.js)
        self.assertIn("wasm[3] !== 109", self.js)

    def test_privacy_and_safety_disclosure_present(self):
        self.assertIn("not uploaded to a server", self.html)
        self.assertIn("not a security audit", self.html)
        self.assertIn("not been audited", self.readme_text())

    def readme_text(self):
        return (APP / "README.md").read_text(encoding="utf-8")

if __name__ == "__main__":
    unittest.main(verbosity=2)
