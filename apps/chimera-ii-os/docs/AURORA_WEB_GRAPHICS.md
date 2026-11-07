# Aurora Web Graphics Architecture

Aurora has two deliberately separate graphics paths:

- **Native desktop:** OpenGL/EGL (and, where available, Vulkan) in the Aurora userspace compositor. These libraries and development headers belong in the Linux/hosted desktop image; a freestanding Koronos kernel does not link desktop GL libraries.
- **Browser desktop:** WebGL 2, with a WebGL 1 fallback, using a local GLSL shader pipeline on an HTML canvas. GitHub Pages cannot access the host's native OpenGL context or a running Koronos kernel.

## Browser runtime

The Aurora WebGL Desktop Gallery is self-contained and does not require a third-party JavaScript renderer CDN. It requests WebGL 2 first and falls back to WebGL 1, compiles/links GLSL shaders, renders an animated Aurora scene, handles resize, capped pixel ratio, reduced motion, render scaling, fullscreen and context loss/restoration. Runtime telemetry reports actual browser state and does not claim that a native Koronos service is running on the static site.

Open: https://amerhwitat.github.io/apps/chimera-ii-os/web/aurora_webgl_desktops.html

## Native runtime packages

The Chimera/Octavian Linux desktop image should include Mesa runtime and development components: \`libgl1\`, \`libglx-mesa0\`, \`libegl1\`, \`libgles2\`, \`libgl-dev\`, \`libegl-dev\`, \`libgles-dev\`, \`libgbm1\`, \`libgl1-mesa-dri\`, and \`mesa-utils\`.

These provide OpenGL/GLX/EGL/GLES userspace libraries and diagnostics for a hosted Linux desktop. They do not create a hardware driver for every GPU; kernel DRM/KMS drivers and firmware remain hardware-specific.

## Validation

The browser workflow checks JavaScript syntax and source contracts, then runs the page in headless Chromium with SwiftShader. That proves a software WebGL path in CI; physical GPU acceleration still needs testing on actual hardware.
