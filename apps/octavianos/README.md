# OctavianOS React + React Native companion

## Browser UI

This folder is published at https://amerhwitat.github.io/apps/octavianos/ by the repository's GitHub Pages workflow. It is a responsive React desktop UI that links to the OctavianOS source and release section.

To build locally:

```sh
npm install
npm run build
npm run dev
```

The Vite base path is configured for the GitHub Pages subdirectory.

## React Native

`mobile/` contains an Expo React Native companion UI. Run:

```sh
cd mobile
npm install
npx expo start
```

This is a companion app UI, not the OctavianOS ARM64 kernel or mobile OS image. App tiles intentionally report that native services are not connected rather than faking file, terminal, or settings operations.

## Native OS status

The UI does not imply Koronos, the microkernel, installer, or mobile hardware support is implemented. Track native boot and service acceptance in https://github.com/amerhwitat/OctavianOS.
