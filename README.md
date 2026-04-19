# Ventura Forward PWA Foundation

This repository contains the non-UI foundation build for Ventura Forward.

## Local commands

- pnpm dev
- pnpm build
- pnpm seed:demo

## PWA icon note

The manifest references icon files in public/icons, but icon assets are intentionally not generated in this foundation pass.
Create these files manually before production release:

- public/icons/icon-192.png
- public/icons/icon-512.png
- public/icons/icon-maskable-512.png
- public/icons/apple-touch-icon.png
