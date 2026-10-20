# Project ENZYLA

**Lunar Site Assessment System** — an interactive 3D Moon exploration tool built for NASA Space Apps Challenge.

## Stack

- **Three.js** — 3D Moon rendering with NASA CGI Moon Kit GLB model
- **React 19** — UI layer (Navbar, HUD, Explorer, Timeline)
- **Tailwind CSS v4** — SpaceX-inspired design system
- **GSAP** — animations
- **Vite** — build tool

## Features

- Full-screen cinematic Moon with 44,000+ procedural stars
- Click any point → smooth zoom to lunar surface
- Real NASA Apollo landing site data (coordinates, LOLA elevation, samples, EVA duration)
- Dynamic sun angle per site based on real mission conditions
- ISS live tracking via wheretheiss.at API
- Mission documentation panel with real NASA activity records
- Site conditions dashboard (sun elevation, comm outage, lunar day phase)

## Apollo Sites

| Mission | Terrain | Elevation | Samples |
|---------|---------|-----------|---------|
| Apollo 11 | Mare Tranquillitatis | −2,376 m | 21.5 kg |
| Apollo 12 | Oceanus Procellarum | −2,568 m | 34.3 kg |
| Apollo 14 | Fra Mauro | −2,471 m | 42.3 kg |
| Apollo 15 | Hadley–Apennine | +3,320 m | 77.3 kg |
| Apollo 16 | Descartes Highlands | +2,115 m | 95.7 kg |
| Apollo 17 | Taurus-Littrow | +1,975 m | 110.5 kg |

## Run

```bash
npm install
npm run dev
```

## Data Sources

- NASA Lunar Reconnaissance Orbiter / LOLA elevation data
- NASA Apollo Mission Planning Documents
- NASA CGI Moon Kit (public domain)
- Solar System Scope star map (CC-BY-4.0)
- ISS position: wheretheiss.at

## Project Structure

```
src/
  main.ts          # Three.js scene — Moon, stars, zoom animation
  main.tsx         # React entry point
  App.tsx          # Root component
  components/      # Navbar, HUD, MoonExplorer, SiteTimeline
  data/            # Apollo site data (real NASA records)
  hooks/           # useISS, useMET, useMoonPhase
public/
  moon.glb         # NASA CGI Moon Kit model
  starmap.jpg      # NASA Deep Star Maps (Solar System Scope)
  starmap-bg.jpg   # Processed background
```
