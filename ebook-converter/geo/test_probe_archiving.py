import importlib.util
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

spec = importlib.util.spec_from_file_location("probe", Path(__file__).with_name("geo-exposure-probe.py"))
probe = importlib.util.module_from_spec(spec)
spec.loader.exec_module(probe)


class ProbeArchiveTests(unittest.TestCase):
    def test_previous_and_current_formats_are_preserved(self):
        with tempfile.TemporaryDirectory() as root:
            md, csv = Path(root) / "report.md", Path(root) / "report.csv"
            md.write_text("old markdown", encoding="utf-8")
            csv.write_text("old csv", encoding="utf-8")
            archived_md, archived_csv = probe.write_probe_reports(md, csv, "new markdown", "new csv")
            archive = Path(archived_md).parent
            self.assertEqual((archive / "previous.md").read_text(), "old markdown")
            self.assertEqual((archive / "previous.csv").read_text(), "old csv")
            self.assertEqual(Path(archived_md).read_text(), md.read_text())
            self.assertEqual(Path(archived_csv).read_text(), csv.read_text())

    def test_identical_timestamps_do_not_overwrite_a_run(self):
        with tempfile.TemporaryDirectory() as root, patch.object(probe, "datetime") as clock:
            clock.now.return_value.strftime.return_value = "same-time"
            md, csv = Path(root) / "report.md", Path(root) / "report.csv"
            first = probe.write_probe_reports(md, csv, "first", "first csv")
            second = probe.write_probe_reports(md, csv, "second", "second csv")
            self.assertNotEqual(first, second)
            self.assertEqual(Path(first[0]).read_text(), "first")
            self.assertEqual(Path(second[0]).read_text(), "second")

    def test_archive_failure_does_not_replace_existing_aliases(self):
        with tempfile.TemporaryDirectory() as root:
            md, csv = Path(root) / "report.md", Path(root) / "report.csv"
            md.write_text("original", encoding="utf-8")
            csv.write_text("original csv", encoding="utf-8")
            with patch.object(probe.Path, "write_text", side_effect=OSError("disk full")):
                with self.assertRaises(OSError):
                    probe.write_probe_reports(md, csv, "replacement", "replacement csv")
            self.assertEqual(md.read_text(), "original")
            self.assertEqual(csv.read_text(), "original csv")


if __name__ == "__main__":
    unittest.main()
