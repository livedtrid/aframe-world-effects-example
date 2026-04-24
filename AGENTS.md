# AGENTS Guide

## Purpose and Scope
- This repo is an 8th Wall + A-Frame WebAR business-presentation experience: tap a detected AR surface to place a single 3D planet, then tap the planet to reveal four concept labels around it.
- Runtime is client-side only; there is no backend service boundary in this project.

## Big-Picture Architecture
- Entry path is `src/app.js` → imports `src/index.css`, registers `tap-place` and a minimal `billboard` component via `AFRAME.registerComponent(...)`.
- Scene composition is in `src/index.html`; `<a-scene tap-place ...>` attaches the custom component to the scene root.

### Interaction flow (spans multiple files)
1. `src/index.html` camera raycaster targets `.cantap` objects (ground + placed planet).
2. Ground entity `#ground` has class `cantap` and emits click events with intersection data.
3. `src/tap-place.js` `tapPlaceComponent.init()` listens to ground clicks.
4. On the **first** valid tap: places one `#planetModel` entity, sets `this.modelPlaced = true`, hides `#promptText`.
5. `model-loaded` on the planet triggers the entrance animations (scale + lift), then starts an idle Y-rotation after `ENTRANCE_DUR` ms.
6. A second `click` listener on the planet entity calls `_revealLabels()` once (`this.messagesRevealed` gate), which builds four text-label entities in a separate non-rotating scene container.

### Key state variables (in `tapPlaceComponent`)
| Variable | Purpose |
|---|---|
| `this.modelPlaced` | Block all placement after the first tap |
| `this.messagesRevealed` | Show labels only once; ignore re-taps |

### Asset declarations
- `<a-assets>` in `src/index.html`: `#planetModel` → `assets/stylized_planet.glb`, `#groundTex` → `assets/sand.jpg`.

## Build and Dev Workflows
- Install + run dev server:
  ```
  npm install
  npm run serve
  ```
- Production build (output to `dist/`):
  ```
  npm run build
  ```
- There is no test script; verification is manual via scene interaction in browser/device.
- To test on a mobile device follow https://8th.io/test-on-mobile

## Tooling and Bundling Details
- Webpack config: `config/webpack.config.js`.
- HTML is generated from `src/index.html` with `HtmlWebpackPlugin` (`inject: false`, so `bundle.js` stays explicitly referenced in HTML).
- Static copy rules mirror `external/`, `src/assets/`, and optional `image-targets/` into `dist/`.
- Custom asset loader `config/asset-loader.js` normalizes Windows paths to Unix-style for emitted asset module strings.

## Project Conventions (Observed)
- Source is plain JS with ESM imports; TypeScript tooling exists (`tsconfig.json`, `ts-loader`) but current app logic is `.js`.
- Register ALL components in `src/app.js` before scene initialization (not inline in HTML).
- A-Frame component modules export plain objects: `export const tapPlaceComponent = { init() {...}, ... }`.
- Short private helper methods on components are prefixed with `_` (e.g., `_spawnPlanet`, `_revealLabels`).
- Direct DOM lookups by id are preferred (`getElementById('ground')`, `getElementById('promptText')`).
- Use `animation__<id>` multi-instance syntax for independent animations on one entity (e.g., `animation__scale`, `animation__lift`, `animation__spin`).

## Integrations and External Dependencies
- Core runtime scripts loaded in `src/index.html`:
  - Local vendor: `external/scripts/8frame-1.5.0.min.js` (A-Frame build).
  - CDN: `@8thwall/xrextras` (provides `xrextras-attach`, `xrextras-loading`, `xrextras-runtime-error`), `@8thwall/landing-page`, `@8thwall/engine-binary`.
- `xrweb` attribute on `<a-scene>` configures 8th Wall world-tracking and the auto-generated desert environment.
- `allowedDevices: any` inside `xrweb` enables the scene on desktop, tablet, and mobile/AR headsets.

## Safe Edit Boundaries for Agents
- Prefer editing `src/` and `config/` only.
- Do **not** hand-edit generated or vendor-like folders: `dist/`, `node_modules/`, `external/scripts/8frame-1.5.0.min.js`.
- If adding behavior, update both structure (`src/index.html`) and component logic (`src/tap-place.js`) so raycaster targets, ids, and event assumptions stay aligned.
- Label entities must be appended to a **sibling container** (not the rotating planet) to avoid inheriting the planet's rotation.
