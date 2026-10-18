from __future__ import annotations

import hashlib
import json
import os
import shutil
import subprocess
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from pathlib import Path

APP_TITLE = "Super Flash & ISO Tool"
CHUNK = 4 * 1024 * 1024


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for block in iter(lambda: stream.read(CHUNK), b""):
            digest.update(block)
    return digest.hexdigest()


def powershell_json(script: str):
    completed = subprocess.run(
        ["powershell.exe", "-NoProfile", "-NonInteractive", "-ExecutionPolicy", "RemoteSigned", "-Command", script],
        capture_output=True, text=True, timeout=20, check=False,
    )
    if completed.returncode:
        raise RuntimeError((completed.stderr or completed.stdout or "PowerShell query failed").strip())
    output = completed.stdout.strip()
    if not output:
        return []
    parsed = json.loads(output)
    return parsed if isinstance(parsed, list) else [parsed]


def list_usb_disks():
    script = (
        "Get-Disk | Select-Object Number,FriendlyName,BusType,Size,IsBoot,IsSystem,IsReadOnly,OperationalStatus "
        "| ConvertTo-Json -Compress"
    )
    rows = powershell_json(script)
    found = []
    for row in rows:
        bus = str(row.get("BusType", ""))
        # Intentionally restrict raw writes to USB disks, and never offer boot/system disks.
        if bus.lower() != "usb" or row.get("IsBoot") or row.get("IsSystem"):
            continue
        size = int(row.get("Size") or 0)
        found.append({
            "number": int(row["Number"]), "name": str(row.get("FriendlyName") or "USB disk"),
            "size": size, "read_only": bool(row.get("IsReadOnly")),
            "status": str(row.get("OperationalStatus") or ""),
        })
    return found


def inspect_iso9660(path: Path) -> dict:
    """Inspect the ISO9660 primary volume descriptor without mounting the image."""
    with path.open("rb") as stream:
        stream.seek(16 * 2048)
        pvd = stream.read(2048)
    if len(pvd) < 2048 or pvd[0] != 1 or pvd[1:6] != b"CD001" or pvd[6] != 1:
        raise ValueError("No valid ISO9660 primary volume descriptor at sector 16.")
    volume = pvd[40:72].decode("ascii", errors="replace").rstrip("\\x00 ").strip()
    blocks = int.from_bytes(pvd[80:84], "little")
    block_size = int.from_bytes(pvd[128:130], "little")
    return {"volume_id": volume, "blocks": blocks, "block_size": block_size,
            "declared_bytes": blocks * block_size, "file_bytes": path.stat().st_size}


def create_iso_from_directory(source_dir: Path, output_path: Path) -> None:
    """Create a Joliet ISO from a directory tree using pycdlib."""
    try:
        import pycdlib
    except ImportError as exc:
        raise RuntimeError("ISO creation requires pycdlib; install requirements.txt and retry.") from exc
    source_dir = source_dir.resolve()
    if not source_dir.is_dir():
        raise ValueError("Choose an existing source directory.")
    if output_path.resolve().is_relative_to(source_dir):
        raise ValueError("The output ISO cannot be created inside its own source directory.")
    iso = pycdlib.PyCdlib()
    iso.new(interchange_level=3, joliet=3)
    directory_count = 0
    file_count = 0

    def add_tree(folder: Path, iso_parent: str, joliet_parent: str):
        nonlocal directory_count, file_count
        entries = sorted(folder.iterdir(), key=lambda p: (not p.is_dir(), p.name.casefold()))
        dir_index = 0
        file_index = 0
        for entry in entries:
            if entry.is_symlink():
                continue
            if entry.is_dir():
                dir_index += 1
                iso_name = f"D{dir_index:06d}"
                iso_path = iso_parent.rstrip("/") + "/" + iso_name
                joliet_path = joliet_parent.rstrip("/") + "/" + entry.name
                iso.add_directory(iso_path=iso_path, joliet_path=joliet_path)
                directory_count += 1
                add_tree(entry, iso_path, joliet_path)
            elif entry.is_file():
                file_index += 1
                iso_name = f"F{file_index:06d}.BIN;1"
                iso_path = iso_parent.rstrip("/") + "/" + iso_name
                joliet_path = joliet_parent.rstrip("/") + "/" + entry.name
                iso.add_file(str(entry), iso_path=iso_path, joliet_path=joliet_path)
                file_count += 1

    try:
        add_tree(source_dir, "", "")
        iso.write(str(output_path))
    finally:
        iso.close()
    if not output_path.is_file() or output_path.stat().st_size < 17 * 2048:
        raise IOError("ISO writer did not produce a plausible ISO image.")
    # Re-read the descriptor as a post-build sanity check.
    inspect_iso9660(output_path)


class FlashTool(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title(APP_TITLE)
        self.geometry("900x680")
        self.minsize(760, 590)
        self.image_path: Path | None = None
        self.disks = []
        self.disk_by_label = {}
        self.busy = False
        self._build()
        self.refresh_disks()
        self.detect_mobile_tools()

    def _build(self):
        root = ttk.Frame(self, padding=16)
        root.pack(fill="both", expand=True)
        ttk.Label(root, text=APP_TITLE, font=("Segoe UI", 21, "bold")).pack(anchor="w")
        ttk.Label(root, text="Image inspection, SHA-256 validation, guarded USB imaging, and mobile-tool diagnostics.",
                  wraplength=840).pack(anchor="w", pady=(4, 12))
        warning = ttk.Label(root, text="WARNING: writing an image erases the selected USB disk. Boot/system disks are excluded.",
                            foreground="#b00020", wraplength=840)
        warning.pack(anchor="w", pady=(0, 12))

        image_box = ttk.LabelFrame(root, text="1. Select and inspect an image", padding=10)
        image_box.pack(fill="x", pady=5)
        row = ttk.Frame(image_box); row.pack(fill="x")
        self.image_label = ttk.Label(row, text="No image selected", wraplength=650)
        self.image_label.pack(side="left", fill="x", expand=True)
        ttk.Button(row, text="Choose image…", command=self.choose_image).pack(side="right")
        row2 = ttk.Frame(image_box); row2.pack(fill="x", pady=(8, 0))
        self.hash_var = tk.StringVar(value="SHA-256: —")
        ttk.Label(row2, textvariable=self.hash_var).pack(side="left", fill="x", expand=True)
        ttk.Button(row2, text="Calculate SHA-256", command=self.calculate_hash).pack(side="right")
        row3 = ttk.Frame(image_box); row3.pack(fill="x", pady=(8, 0))
        ttk.Label(row3, text="Expected SHA-256 (optional):").pack(side="left")
        self.expected_hash_var = tk.StringVar()
        ttk.Entry(row3, textvariable=self.expected_hash_var).pack(side="left", fill="x", expand=True, padx=8)
        ttk.Button(row3, text="Verify checksum", command=self.verify_expected_hash).pack(side="right")
        iso_actions = ttk.Frame(image_box); iso_actions.pack(fill="x", pady=(8, 0))
        ttk.Button(iso_actions, text="Inspect ISO9660 metadata", command=self.inspect_selected_iso).pack(side="left")
        ttk.Button(iso_actions, text="Create ISO from folder…", command=self.create_iso_dialog).pack(side="left", padx=(8, 0))

        disk_box = ttk.LabelFrame(root, text="2. Select removable USB disk", padding=10)
        disk_box.pack(fill="x", pady=5)
        row = ttk.Frame(disk_box); row.pack(fill="x")
        self.disk_combo = ttk.Combobox(row, state="readonly")
        self.disk_combo.pack(side="left", fill="x", expand=True)
        ttk.Button(row, text="Refresh disks", command=self.refresh_disks).pack(side="left", padx=(8, 0))
        self.disk_detail = tk.StringVar(value="USB disk details appear here.")
        ttk.Label(disk_box, textvariable=self.disk_detail, wraplength=820).pack(anchor="w", pady=(8, 0))
        self.disk_combo.bind("<<ComboboxSelected>>", self.on_disk_selected)

        write_box = ttk.LabelFrame(root, text="3. Guarded raw image write", padding=10)
        write_box.pack(fill="x", pady=5)
        ttk.Label(write_box, text="Type the exact confirmation shown for the selected disk. Run as Administrator if Windows requires it.",
                  wraplength=820).pack(anchor="w")
        self.confirm_var = tk.StringVar()
        ttk.Entry(write_box, textvariable=self.confirm_var).pack(fill="x", pady=7)
        self.verify_var = tk.BooleanVar(value=True)
        ttk.Checkbutton(write_box, text="Read back and verify written bytes (slower)", variable=self.verify_var).pack(anchor="w")
        self.write_button = ttk.Button(write_box, text="ERASE USB AND WRITE IMAGE", command=self.start_write)
        self.write_button.pack(anchor="w", pady=(8, 0))
        self.progress = ttk.Progressbar(write_box, mode="determinate", maximum=100)
        self.progress.pack(fill="x", pady=(8, 0))

        mobile_box = ttk.LabelFrame(root, text="4. Mobile tools (diagnostics only)", padding=10)
        mobile_box.pack(fill="x", pady=5)
        self.mobile_var = tk.StringVar(value="Checking for adb / fastboot…")
        ttk.Label(mobile_box, textvariable=self.mobile_var, wraplength=820).pack(anchor="w")
        mobile_buttons = ttk.Frame(mobile_box); mobile_buttons.pack(anchor="w", pady=(8, 0))
        ttk.Button(mobile_buttons, text="Check connected Android devices", command=self.detect_mobile_tools).pack(side="left")
        ttk.Button(mobile_buttons, text="Read-only device preflight", command=self.mobile_preflight).pack(side="left", padx=(8, 0))

        self.status = tk.StringVar(value="Ready. Inspect the image and verify the target disk before writing.")
        ttk.Label(root, textvariable=self.status, wraplength=840).pack(anchor="w", pady=(12, 0))
        ttk.Label(root, text="No generic mobile ROM flashing is attempted: Android firmware and recovery procedures vary by device and vendor.",
                  wraplength=840).pack(anchor="w", pady=(4, 0))


    def verify_expected_hash(self):
        if not self.image_path:
            messagebox.showinfo("Select image", "Choose an image first.")
            return
        expected = self.expected_hash_var.get().strip().lower()
        if len(expected) != 64 or any(ch not in "0123456789abcdef" for ch in expected):
            messagebox.showerror("Invalid checksum", "Enter a 64-character hexadecimal SHA-256 digest.")
            return
        image = self.image_path
        self.status.set("Verifying expected SHA-256…")
        def worker():
            try:
                actual = sha256_file(image)
                passed = actual.lower() == expected
                self.after(0, lambda: self.hash_var.set("SHA-256: " + actual))
                self.after(0, lambda: self.status.set("SHA-256 verification " + ("PASSED" if passed else "FAILED")))
                self.after(0, lambda: messagebox.showinfo("Checksum result" if passed else "Checksum mismatch",
                    f"Expected: {expected}\nActual:   {actual}\n\n" +
                    ("The digest matches." if passed else "Do not flash this image until its origin and integrity are verified.")))
            except Exception as exc:
                self.after(0, lambda: messagebox.showerror("Checksum failed", str(exc)))
        threading.Thread(target=worker, daemon=True).start()

    def inspect_selected_iso(self):
        if not self.image_path:
            messagebox.showinfo("Select image", "Choose an image first.")
            return
        try:
            details = inspect_iso9660(self.image_path)
            messagebox.showinfo("ISO9660 inspection",
                f'Volume ID: {details["volume_id"] or "(blank)"}\n'
                f'Logical block size: {details["block_size"]:,} bytes\n'
                f'Declared image size: {details["declared_bytes"]:,} bytes\n'
                f'Actual file size: {details["file_bytes"]:,} bytes')
        except Exception as exc:
            messagebox.showerror("ISO inspection failed", str(exc))

    def create_iso_dialog(self):
        source = filedialog.askdirectory(title="Choose folder contents for new ISO")
        if not source:
            return
        output = filedialog.asksaveasfilename(title="Save new ISO image",
            defaultextension=".iso", filetypes=[("ISO image", "*.iso")])
        if not output:
            return
        source_path, output_path = Path(source), Path(output)
        if output_path.exists() and not messagebox.askyesno("Overwrite ISO?",
                f"{output_path} already exists. Replace it?"):
            return
        self.status.set("Creating ISO image…")
        def worker():
            try:
                create_iso_from_directory(source_path, output_path)
                details = inspect_iso9660(output_path)
                self.after(0, lambda: self.status.set(f"ISO created and validated: {output_path.name}"))
                self.after(0, lambda: messagebox.showinfo("ISO created",
                    f"Created and validated {output_path}\n{details['file_bytes']:,} bytes\n"
                    f"Volume: {details['volume_id'] or '(blank)'}"))
            except Exception as exc:
                self.after(0, lambda: self.status.set("ISO creation failed: " + str(exc)))
                self.after(0, lambda: messagebox.showerror("ISO creation failed", str(exc)))
        threading.Thread(target=worker, daemon=True).start()

    def choose_image(self):
        chosen = filedialog.askopenfilename(
            title="Choose disk image",
            filetypes=[("Disk images", "*.iso *.img *.bin *.rom *.raw *.vhd *.vhdx"), ("All files", "*.*")]
        )
        if not chosen:
            return
        path = Path(chosen)
        if not path.is_file() or path.stat().st_size <= 0:
            messagebox.showerror("Invalid image", "Choose a non-empty regular file.")
            return
        self.image_path = path
        self.image_label.configure(text=f"{path}  ({path.stat().st_size:,} bytes)")
        self.hash_var.set("SHA-256: not calculated")
        self.status.set("Image selected. Calculate its hash and inspect the target disk.")

    def calculate_hash(self):
        if not self.image_path:
            messagebox.showinfo("Select image", "Choose an image first.")
            return
        self.status.set("Calculating SHA-256…")
        def worker():
            try:
                digest = sha256_file(self.image_path)
                self.after(0, lambda: self.hash_var.set("SHA-256: " + digest))
                self.after(0, lambda: self.status.set("Image hash calculated."))
            except Exception as exc:
                self.after(0, lambda: messagebox.showerror("Hash failed", str(exc)))
        threading.Thread(target=worker, daemon=True).start()

    def refresh_disks(self):
        try:
            self.disks = list_usb_disks()
            labels = []
            self.disk_by_label = {}
            for d in self.disks:
                label = f'Disk {d["number"]} — {d["name"]} — {d["size"]:,} bytes'
                labels.append(label); self.disk_by_label[label] = d
            self.disk_combo["values"] = labels
            if labels:
                self.disk_combo.current(0); self.on_disk_selected()
                self.status.set(f"Found {len(labels)} eligible USB disk(s).")
            else:
                self.disk_detail.set("No eligible USB disks found. Boot/system disks are deliberately excluded.")
                self.status.set("No eligible USB disk detected. Connect a removable USB drive and refresh.")
        except Exception as exc:
            self.disks = []; self.disk_combo["values"] = []
            self.disk_detail.set("Could not query disks. Windows PowerShell/Get-Disk is required.")
            self.status.set("Disk query failed: " + str(exc))

    def on_disk_selected(self, _event=None):
        d = self.disk_by_label.get(self.disk_combo.get())
        if not d:
            return
        self.disk_detail.set(
            f'Confirmation required: ERASE DISK {d["number"]} | Capacity: {d["size"]:,} bytes | '
            f'Read-only: {d["read_only"]} | Status: {d["status"]}'
        )

    def detect_mobile_tools(self):
        adb, fastboot = shutil.which("adb"), shutil.which("fastboot")
        pieces = [f"adb: {adb or 'not installed'}", f"fastboot: {fastboot or 'not installed'}"]
        if adb:
            try:
                r = subprocess.run([adb, "devices"], capture_output=True, text=True, timeout=8)
                pieces.append("adb devices: " + " | ".join(r.stdout.strip().splitlines()[1:]) if r.stdout.strip() else "adb devices: no output")
            except Exception as exc:
                pieces.append("adb query failed: " + str(exc))
        if fastboot:
            try:
                r = subprocess.run([fastboot, "devices"], capture_output=True, text=True, timeout=8)
                pieces.append("fastboot devices: " + (r.stdout.strip() or "none"))
            except Exception as exc:
                pieces.append("fastboot query failed: " + str(exc))
        self.mobile_var.set("   ".join(pieces))

    def mobile_preflight(self):
        adb, fastboot = shutil.which("adb"), shutil.which("fastboot")
        if not adb and not fastboot:
            messagebox.showinfo("Mobile preflight", "Install Android Platform Tools (adb/fastboot) first.")
            return
        lines = ["READ-ONLY PREFLIGHT — no flash/write commands will be issued."]
        def query(command, timeout=8):
            result = subprocess.run(command, capture_output=True, text=True, timeout=timeout, check=False)
            return (result.stdout + "\n" + result.stderr).strip()
        try:
            if adb:
                devices = query([adb, "devices", "-l"])
                lines.extend(["", "ADB devices:", devices or "(no output)"])
                serials = []
                for line in devices.splitlines()[1:]:
                    fields = line.split()
                    if len(fields) >= 2 and fields[1] == "device":
                        serials.append(fields[0])
                if len(serials) == 1:
                    serial = serials[0]
                    for prop in ("ro.product.manufacturer", "ro.product.model", "ro.product.device",
                                 "ro.build.fingerprint", "ro.boot.flash.locked", "ro.boot.verifiedbootstate"):
                        value = query([adb, "-s", serial, "shell", "getprop", prop])
                        lines.append(f"{prop}: {value or '(empty)'}")
                elif len(serials) > 1:
                    lines.append("ADB preflight skipped: multiple authorized devices; disconnect extras to avoid ambiguity.")
            if fastboot:
                devices = query([fastboot, "devices"])
                lines.extend(["", "Fastboot devices:", devices or "(none detected)"])
                serials = [line.split()[0] for line in devices.splitlines() if line.split()]
                if len(serials) == 1:
                    serial = serials[0]
                    for variable in ("product", "is-userspace", "unlocked", "current-slot", "secure"):
                        value = query([fastboot, "-s", serial, "getvar", variable])
                        lines.append(f"fastboot {variable}: {value or '(not reported)'}")
                elif len(serials) > 1:
                    lines.append("Fastboot preflight skipped: multiple devices detected.")
            lines.append("\nNo firmware was written. A model-specific signed profile and vendor documentation are required before any future flashing support.")
            messagebox.showinfo("Mobile device preflight", "\n".join(lines)[:12000])
        except Exception as exc:
            messagebox.showerror("Mobile preflight failed", str(exc))

    def start_write(self):
        if self.busy:
            return
        image = self.image_path
        d = self.disk_by_label.get(self.disk_combo.get())
        if not image or not image.is_file():
            messagebox.showerror("No image", "Choose a valid image first."); return
        if not d:
            messagebox.showerror("No target", "Select an eligible USB disk."); return
        if d["read_only"]:
            messagebox.showerror("Read-only disk", "The selected disk is read-only."); return
        size = image.stat().st_size
        if size <= 0 or size > d["size"]:
            messagebox.showerror("Capacity mismatch", "Image must be non-empty and no larger than the selected USB disk."); return
        expected = f'ERASE DISK {d["number"]}'
        if self.confirm_var.get().strip() != expected:
            messagebox.showerror("Confirmation mismatch", f'Type exactly: {expected}'); return
        message = (f'You are about to overwrite USB Disk {d["number"]} ({d["name"]}), capacity {d["size"]:,} bytes, '
                   f'with {image.name} ({size:,} bytes). ALL EXISTING DATA ON THAT DISK WILL BE LOST.')
        if not messagebox.askyesno("Final destructive confirmation", message + "\n\nContinue?"):
            return
        self.busy = True; self.write_button.configure(state="disabled"); self.progress["value"] = 0
        threading.Thread(target=self._write_worker, args=(image, d, size, self.verify_var.get()), daemon=True).start()

    def _write_worker(self, image: Path, disk: dict, total: int, verify: bool):
        handle = None
        try:
            # Re-query immediately before opening the raw device to reduce stale-selection risk.
            current = {x["number"]: x for x in list_usb_disks()}.get(disk["number"])
            if not current or current["name"] != disk["name"] or current["size"] != disk["size"] or current["read_only"]:
                raise RuntimeError("USB device identity/state changed. Refresh the disk list and retry.")
            handle = open(r"\\.\PhysicalDrive" + str(disk["number"]), "r+b", buffering=0)
            written = 0
            with image.open("rb") as source:
                while True:
                    block = source.read(CHUNK)
                    if not block:
                        break
                    n = handle.write(block)
                    if n != len(block):
                        raise IOError(f"Short raw-device write at byte {written}.")
                    written += n
                    percent = int(written * 100 / total)
                    self.after(0, lambda p=percent: self.progress.configure(value=p))
            handle.flush()
            if verify:
                handle.seek(0)
                with image.open("rb") as source:
                    checked = 0
                    while True:
                        expected = source.read(CHUNK)
                        if not expected:
                            break
                        actual = handle.read(len(expected))
                        if actual != expected:
                            raise IOError(f"Read-back verification failed at byte {checked}.")
                        checked += len(expected)
                        percent = int(checked * 100 / total)
                        self.after(0, lambda p=percent: self.progress.configure(value=p))
            self.after(0, lambda: messagebox.showinfo("Write complete", f"Image written successfully. Verification: {'passed' if verify else 'not requested'}. Safely eject the USB disk before unplugging."))
            self.after(0, lambda: self.status.set("Write complete. Verify boot behavior on the target device."))
        except Exception as exc:
            self.after(0, lambda: messagebox.showerror("Write failed", f"{exc}\n\nNo success is claimed. Inspect the disk before retrying."))
            self.after(0, lambda: self.status.set("Write failed: " + str(exc)))
        finally:
            if handle:
                try: handle.close()
                except Exception: pass
            self.after(0, self._write_finished)

    def _write_finished(self):
        self.busy = False
        self.write_button.configure(state="normal")
        self.refresh_disks()


if __name__ == "__main__":
    if os.name != "nt":
        # Image inspection/hash UI still works cross-platform; physical disk write requires Windows.
        pass
    FlashTool().mainloop()
