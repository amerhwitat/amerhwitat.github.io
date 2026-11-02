#!/usr/bin/env python3
"""Regression tests for shared asset versioning and idempotent injection."""
import importlib.util
import unittest
from pathlib import Path

SCRIPT = Path(__file__).with_name("version_shared_assets.py")
SPEC = importlib.util.spec_from_file_location("version_shared_assets", SCRIPT)
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class SharedAssetVersioningTests(unittest.TestCase):
    def test_existing_css_and_js_references_are_versioned(self):
        source = """<head><link rel="stylesheet" href="/site-interactions.css?v=1">
        <script src="/site-interactions.js?v=2"></script></head><body></body>"""
        result = MODULE.transform_html(source)
        self.assertIn('href="/site-interactions.css?v=3"', result)
        self.assertIn('src="/site-interactions.js?v=3"', result)
        self.assertNotIn("?v=1", result)
        self.assertNotIn("?v=2", result)

    def test_unversioned_and_single_quoted_references_are_versioned(self):
        source = """<head><link href='/assets/site-interactions.css'></head>
        <body><script src='/assets/site-interactions.js'></script></body>"""
        result = MODULE.transform_html(source)
        self.assertIn("href='/assets/site-interactions.css?v=3'", result)
        self.assertIn("src='/assets/site-interactions.js?v=3'", result)

    def test_missing_assets_are_inserted(self):
        result = MODULE.transform_html("<html><head></head><body></body></html>")
        self.assertIn('href="/site-interactions.css?v=3"', result)
        self.assertIn('src="/site-interactions.js?v=3"', result)

    def test_existing_assets_are_not_duplicated(self):
        source = """<html><head><link href="/site-interactions.css?v=3"></head>
        <body><script src="/site-interactions.js?v=3"></script></body></html>"""
        result = MODULE.transform_html(source)
        self.assertEqual(result.count("site-interactions.css"), 1)
        self.assertEqual(result.count("site-interactions.js"), 1)

    def test_transform_is_idempotent(self):
        source = "<html><head></head><body></body></html>"
        once = MODULE.transform_html(source)
        self.assertEqual(MODULE.transform_html(once), once)

    def test_pages_without_closing_head_or_body_are_not_corrupted(self):
        source = "<html><body>fragment"
        self.assertEqual(MODULE.transform_html(source), source)


if __name__ == "__main__":
    unittest.main()
