#!/usr/bin/env python3
"""Regression tests for site-local URL resolution."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("check_site_links.py")
SPEC = importlib.util.spec_from_file_location("check_site_links", SCRIPT)
CHECKER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECKER)


class SiteLinkResolutionTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "apps").mkdir()
        self.page = self.root / "index.html"
        self.page.write_text("<html></html>", encoding="utf-8")
        CHECKER.ROOT = self.root
        CHECKER.errors = []
        CHECKER.checked = 0

    def tearDown(self):
        self.temp.cleanup()

    def test_root_relative_missing_target_is_reported(self):
        CHECKER.check(self.page, "/apps/not-published.html")
        self.assertEqual(len(CHECKER.errors), 1)
        self.assertIn("missing apps/not-published.html", CHECKER.errors[0])

    def test_root_relative_and_encoded_existing_targets_resolve(self):
        target = self.root / "apps" / "has space.html"
        target.write_text("ok", encoding="utf-8")
        CHECKER.check(self.page, "/apps/has%20space.html")
        self.assertEqual(CHECKER.errors, [])

    def test_relative_target_resolves_from_page_directory(self):
        (self.root / "apps" / "child.html").write_text("ok", encoding="utf-8")
        page = self.root / "apps" / "parent.html"
        page.write_text("ok", encoding="utf-8")
        CHECKER.check(page, "child.html")
        self.assertEqual(CHECKER.errors, [])


if __name__ == "__main__":
    unittest.main()
