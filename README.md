
## what it does

- full screen 3D moon rendered in the browser, no downloads
- click anywhere on the moon → camera zooms in smooth
- shows real Apollo landing site infos (coordinates, what they did there, how much they collected)
- sun lighting changes based on what angle the sun actually was at each mission
- live ISS position updating every 5 seconds (real data)
- star field with 44,000+ stars behind the moon
- bottom tab (jump between Apollo 11 through 17) 

---

## apollo sites included

| mission | where | elevation | samples brought back |
|---------|-------|-----------|----------------------|
| Apollo 11 | Sea of Tranquility | −2,376 m | 21.5 kg |
| Apollo 12 | Ocean of Storms | −2,568 m | 34.3 kg |
| Apollo 14 | Fra Mauro Highlands | −2,471 m | 42.3 kg |
| Apollo 15 | Hadley–Apennine | +3,320 m | 77.3 kg |
| Apollo 16 | Descartes Highlands | +2,115 m | 95.7 kg |
| Apollo 17 | Taurus-Littrow Valley | +1,975 m | 110.5 kg |

---

## run it locally

```bash
npm install
npm run dev
```

then open `http://localhost:5173`

---

## tech stackz

- Three.js for the 3D moon
- React + Tailwind for the UI
- Vite for the build
- NASA CGI Moon Kit (the actual 3D model NASA released)
- Real LOLA elevation data from the Lunar Reconnaissance Orbiter

---

## data sources

 mission data from NASA mission planning docs, LOLA elevation database, and Apollo flight records.

- NASA LRO / LOLA — elevation data
- NASA History Division — mission documentation  
- wheretheiss.at — live ISS position
- Solar System Scope — star map texture (CC-BY-4.0)
- NASA CGI Moon Kit — 3D model (public domain)
