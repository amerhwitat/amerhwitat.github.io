#!/usr/bin/env python3
"""Tests for unified application catalog validation."""
import importlib.util
import tempfile
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("validate_unified_app_catalog.py")
SPEC = importlib.util.spec_from_file_location("catalog_validator", SCRIPT)
CHECKER = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(CHECKER)


class CatalogValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "apps/chimera-ii-os/web").mkdir(parents=True)
        (self.root / "apps/chimera-ii-os/web/real.html").write_text("ok", encoding="utf-8")
        CHECKER.ROOT = self.root
        CHECKER.REGISTRY = self.root / "apps/chimera-ii-os/web/aurora_apps.json"

    def tearDown(self):
        self.temp.cleanup()

    def app(self, **changes):
        value = {"id": "one", "title": "One", "mode": "embedded", "url": "real.html"}
        value.update(changes)
        return value

    def registry(self, apps):
        return {"schema": "chimera-aurora-apps/v13", "categories": [{"id": "test", "apps": apps}]}

    def test_valid_local_target(self):
        self.assertEqual(CHECKER.check_apps(self.registry([self.app()])), [])

    def test_duplicate_ids_rejected(self):
        errors = CHECKER.check_apps(self.registry([self.app(), self.app(title="Second")]))
        self.assertTrue(any("duplicate Aurora app id" in error for error in errors))

    def test_missing_target_rejected(self):
        errors = CHECKER.check_apps(self.registry([self.app(url="missing.html")]))
        self.assertTrue(any("missing local target" in error for error in errors))

    def test_missing_launch_target_rejected(self):
        errors = CHECKER.check_apps(self.registry([{"id": "one", "title": "One", "mode": "embedded"}]))
        self.assertTrue(any("missing launch target" in error for error in errors))

    def test_duplicate_search_paths_rejected(self):
        errors = CHECKER.check_index({"pages": [{"p": "same.html", "t": "A"}, {"p": "same.html", "t": "B"}]})
        self.assertTrue(any("duplicate search index path" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
