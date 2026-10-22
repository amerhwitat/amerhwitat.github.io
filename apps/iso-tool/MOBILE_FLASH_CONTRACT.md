# Mobile and Flash Release Contract


## Mobile / flash integration contract (2026-10-22)

- Mobile companions display status and call supported native services; they are not substitutes for bootable mobile OS images.
- Flash UI requires image SHA-256 match, explicit target device, typed destructive confirmation, and native-side safety checks. The native bridge must revalidate target identity, reject mounted/system disks and stale device selection, require CHIMERA_FLASH_CONFIRM=YES, and verify post-write read-back.
- No generic Android/iOS ROM flashing: exact device profile, signed artifacts, verified boot and OEM constraints are mandatory. ADB/Fastboot diagnostics are read-only by default.
- Publish only verified target-specific artifacts; show NOT RUN/UNSUPPORTED where hardware evidence is absent.
