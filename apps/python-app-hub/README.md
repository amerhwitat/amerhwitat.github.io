# Python Application Hub

A staged migration inventory for 15 repositories, a Tkinter desktop catalog, and the Super Flash & ISO Tool. The inventory currently tracks 51 concrete source candidates. It is not a claim that every candidate has been ported.

## Run locally

Requirements: Python 3.11+.

```powershell
python -m pip install -r apps/python-app-hub/requirements.txt
python apps/python-app-hub/python_app_hub.py
python apps/python-app-hub/super-flash-iso/super_flash_iso.py
```

From the repository root, create Windows executables:

```powershell
python -m PyInstaller --noconfirm --clean --onefile --windowed --name PythonAppHub --add-data "apps/python-app-hub/apps.json;." apps/python-app-hub/python_app_hub.py
python -m PyInstaller --noconfirm --clean --onefile --windowed --name SuperFlashISO --hidden-import pycdlib apps/python-app-hub/super-flash-iso/super_flash_iso.py
```

## Super Flash & ISO Tool

- ISO9660 primary-volume descriptor inspection.
- Create a Joliet ISO from a directory tree and sanity-check its volume descriptor.
- Calculate SHA-256 and compare an expected digest.
- List eligible USB disks on Windows, exclude boot/system disks, require capacity checks and two confirmations, and optionally read back written bytes.
- Read-only ADB/Fastboot preflight diagnostics.

**Raw USB writes erase the target.** Back up the device, verify the image origin and checksum, and select the disk by its number and capacity. The program deliberately does not issue generic phone-ROM flash commands. Mobile firmware requires a validated device-specific profile and signed, matching images; this project currently supports diagnostics only.

## Tests

```powershell
python -m unittest discover -s apps/python-app-hub/super-flash-iso -p "test_*.py" -v
python -m compileall -q apps/python-app-hub
```

CI runs the ISO tests on Linux and Windows, builds both desktop executables, adds version/checksum metadata, and uploads a ZIP artifact. Use the [Python build workflow](https://github.com/amerhwitat/amerhwitat.github.io/actions/workflows/python-app-hub.yml) and download the `PythonDesktopTools-Windows-x64` artifact from a successful run.

## Migration acceptance

Port one app at a time. Record original entry points and dependencies, preserve the old implementation, create deterministic parity tests, add GUI/CLI interfaces, test Windows packaging, publish checksums and only then mark the port complete. Kernel, bootloader, driver, and architecture-specific code remains native when Python is not an appropriate replacement.

- Web hub: https://amerhwitat.github.io/apps/python-app-hub/
- Migration backlog: migration-plan.json
- Source repository: https://github.com/amerhwitat/amerhwitat.github.io
