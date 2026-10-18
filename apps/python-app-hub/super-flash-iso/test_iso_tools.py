from __future__ import annotations
import tempfile
import unittest
from pathlib import Path
from super_flash_iso import inspect_iso9660, create_iso_from_directory

class Iso9660Tests(unittest.TestCase):
    def test_rejects_non_iso_file(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "not.iso"
            path.write_bytes(b"not an ISO image")
            with self.assertRaises(ValueError):
                inspect_iso9660(path)

    def test_reads_primary_volume_descriptor(self):
        with tempfile.TemporaryDirectory() as td:
            path = Path(td) / "fixture.iso"
            image = bytearray(17 * 2048)
            pvd = 16 * 2048
            image[pvd] = 1
            image[pvd + 1:pvd + 6] = b"CD001"
            image[pvd + 6] = 1
            image[pvd + 40:pvd + 48] = b"TESTVOL "
            image[pvd + 80:pvd + 84] = (17).to_bytes(4, "little")
            image[pvd + 128:pvd + 130] = (2048).to_bytes(2, "little")
            path.write_bytes(image)
            result = inspect_iso9660(path)
            self.assertEqual(result["volume_id"], "TESTVOL")
            self.assertEqual(result["block_size"], 2048)
            self.assertEqual(result["declared_bytes"], 17 * 2048)

    def test_creates_and_reopens_iso_when_pycdlib_available(self):
        try:
            import pycdlib  # noqa: F401
        except ImportError:
            self.skipTest("pycdlib not installed")
        with tempfile.TemporaryDirectory() as td:
            root = Path(td) / "source"
            root.mkdir()
            (root / "hello.txt").write_text("hello ISO\n", encoding="utf-8")
            out = Path(td) / "test.iso"
            create_iso_from_directory(root, out)
            result = inspect_iso9660(out)
            self.assertGreaterEqual(result["file_bytes"], 17 * 2048)
            self.assertEqual(result["block_size"], 2048)

if __name__ == "__main__":
    unittest.main()
