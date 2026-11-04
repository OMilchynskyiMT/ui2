# ui2

Vue 3 + Vite device UI, with a component showcase kept alongside production views.

## Development

```sh
npm ci
npm run dev:demo    # component showcase and mock device pages
npm run dev:mtr3    # production application (MTR3)
npm run dev:mtcap3  # production application (MTCAP3)
```

The demo build is served under `/ui2/`, matching the GitHub Pages base URL.
The application demonstration starts at `/#/demo/application/dashboard` (after the base path),
and the component showcase is under `/#/demo/components/inputs`.

## Builds

```sh
npm run build:demo    # GitHub Pages, base /ui2/
npm run build:mtr3    # firmware, base /
npm run build:mtcap3  # firmware, base /
```

All builds write to `dist/`. The GitHub Pages workflow uses `build:demo`.

- `src/demo/` contains the demonstration application, component examples, and demo-only routes.
- `src/views/` and `src/router/device.ts` are reserved for actual device views and routes.
- `src/lib/`, `src/components/`, and `src/composables/` remain shared.
- The demo bootstrap does not restore user sessions, install device access guards,
  or start device-status polling. Mock behavior remains local to the demonstration.
- Firmware builds exclude `src/demo/` code altogether. The build configuration
  verifies this in the output bundle and fails if a demo module is accidentally included.

Production views currently contain explicit placeholders; they do not use the mock pages.

## Checks

```sh
npm run type-check
npm run lint
npm run test:run
```
