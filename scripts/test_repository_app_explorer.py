#!/usr/bin/env python3
"""Static contract tests for the public repository app explorer."""
import re
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PAGE = ROOT / "apps" / "repository-app-explorer" / "index.html"


class RepositoryExplorerContractTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = PAGE.read_text(encoding="utf-8")
        match = re.search(r"const repos\s*=\s*(\[.*?\]);", cls.html, re.S)
        if not match:
            raise AssertionError("Explorer repository allowlist is missing")
        # This file deliberately keeps the allowlist as a simple JS array of pairs.
        cls.repo_pairs = re.findall(r"\['([A-Za-z0-9_.-]+)','([A-Za-z0-9_.-]+)'\]", match.group(1))

    def test_public_allowlist_has_unique_expected_repositories(self):
        names = [name for name, _ in self.repo_pairs]
        self.assertEqual(len(names), 14)
        self.assertEqual(len(names), len(set(names)))
        self.assertIn(("amerhwitat.github.io", "main"), self.repo_pairs)
        self.assertIn(("general", "master"), self.repo_pairs)
        self.assertIn(("OctavianOS", "main"), self.repo_pairs)

    def test_partial_results_and_api_failures_are_visible(self):
        self.assertIn("t.truncated", self.html)
        self.assertIn("catch(e)", self.html)
        self.assertIn("partial/error results", self.html)
        self.assertIn("GitHub API", self.html)

    def test_untrusted_paths_and_names_are_escaped_before_rendering(self):
        self.assertIn("const esc=s=>", self.html)
        self.assertIn("esc(x.path)", self.html)
        self.assertIn("esc(x.repo)", self.html)
        self.assertIn("rel=\"noopener noreferrer\"", self.html)

    def test_audio_is_opt_in_and_reduced_motion_is_supported(self):
        self.assertIn("let items=[],sound=false", self.html)
        self.assertIn("prefers-reduced-motion:reduce", self.html)
        self.assertIn("aria-pressed", self.html)
        self.assertIn("aria-live=\"polite\"", self.html)

    def test_language_count_includes_all_reported_languages(self):
        self.assertIn("Object.keys(l).sort().join(', ')||'unknown'", self.html)
        self.assertIn("items.flatMap(x=>x.language.split(', '))", self.html)


if __name__ == "__main__":
    unittest.main()
