// Real NASA LOLA (Lunar Orbiter Laser Altimeter) elevation data
// Coordinates from NASA Lunar Reconnaissance Orbiter mission records
export interface ApolloSite {
  id: string;
  num: string;
  name: string;
  year: number;
  lat: number;        // selenographic latitude °
  lon: number;        // selenographic longitude °
  elevation: number;  // meters above mean lunar radius (LOLA data)
  elevStr: string;
  terrain: 'Mare' | 'Highlands' | 'Valley';
  region: string;
  description: string;
  samples: string;    // kg collected
  crew: string[];
  duration: string;   // surface EVA total
  slope: string;      // average slope at landing site
  rockAbundance: string;
}

export const APOLLO_SITES: ApolloSite[] = [
  {
    id: 'A11', num: '11', name: 'Apollo 11', year: 1969,
    lat: 0.6741, lon: 23.4723,
    elevation: -2376, elevStr: '−2,376 m',
    terrain: 'Mare', region: 'Mare Tranquillitatis',
    description: 'First crewed lunar landing. Armstrong and Aldrin spent 2h 31m on the surface. The site sits in a relatively flat basaltic mare with minimal slope variation.',
    samples: '21.5 kg', crew: ['Neil Armstrong', 'Buzz Aldrin', 'Michael Collins'],
    duration: '2h 31m', slope: '< 2°', rockAbundance: 'Low',
  },
  {
    id: 'A12', num: '12', name: 'Apollo 12', year: 1969,
    lat: -3.0128, lon: -23.4219,
    elevation: -2568, elevStr: '−2,568 m',
    terrain: 'Mare', region: 'Oceanus Procellarum',
    description: 'Precision landing 163 m from Surveyor 3. Two EVAs totalling 7h 45m. The crew recovered Surveyor 3 camera hardware for Earth analysis.',
    samples: '34.3 kg', crew: ['Pete Conrad', 'Alan Bean', 'Richard Gordon'],
    duration: '7h 45m', slope: '< 3°', rockAbundance: 'Low–Medium',
  },
  {
    id: 'A14', num: '14', name: 'Apollo 14', year: 1971,
    lat: -3.6453, lon: -17.4714,
    elevation: -2471, elevStr: '−2,471 m',
    terrain: 'Highlands', region: 'Fra Mauro',
    description: 'Fra Mauro formation — ancient ejecta from the Imbrium impact. Alan Shepard famously hit two golf balls on the surface. Cone Crater EVA reached 355 m depth.',
    samples: '42.3 kg', crew: ['Alan Shepard', 'Edgar Mitchell', 'Stuart Roosa'],
    duration: '9h 22m', slope: '5–8°', rockAbundance: 'Medium',
  },
  {
    id: 'A15', num: '15', name: 'Apollo 15', year: 1971,
    lat: 26.1322, lon: 3.6339,
    elevation: 3320, elevStr: '+3,320 m',
    terrain: 'Valley', region: 'Hadley–Apennine',
    description: 'First J-class mission with Lunar Roving Vehicle. Collected the 4.1 Ga Genesis Rock. Hadley Rille — a 1.5 km wide lava channel — explored for the first time.',
    samples: '77.3 kg', crew: ['David Scott', 'James Irwin', 'Alfred Worden'],
    duration: '18h 33m', slope: '8–12°', rockAbundance: 'High',
  },
  {
    id: 'A16', num: '16', name: 'Apollo 16', year: 1972,
    lat: -8.9730, lon: 15.4986,
    elevation: 2115, elevStr: '+2,115 m',
    terrain: 'Highlands', region: 'Descartes Highlands',
    description: 'Only mission to sample ancient highland crust. Young and Duke drove 26.7 km in the rover. The highlands proved to be volcanic in origin — disproving pre-mission predictions.',
    samples: '95.7 kg', crew: ['John Young', 'Charles Duke', 'Ken Mattingly'],
    duration: '20h 14m', slope: '10–15°', rockAbundance: 'High',
  },
  {
    id: 'A17', num: '17', name: 'Apollo 17', year: 1972,
    lat: 20.1908, lon: 30.7717,
    elevation: 1975, elevStr: '+1,975 m',
    terrain: 'Valley', region: 'Taurus-Littrow',
    description: 'Last crewed Moon landing to date. Geologist Harrison Schmitt discovered orange volcanic glass — pyroclastic fire-fountain deposits 3.7 Ga old. 22h of total EVA time.',
    samples: '110.5 kg', crew: ['Gene Cernan', 'Harrison Schmitt', 'Ronald Evans'],
    duration: '22h 4m', slope: '7–10°', rockAbundance: 'Very High',
  },
];
