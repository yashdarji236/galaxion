// Shared mock data store for Offline Mock Mode fallback
const mockCraters = [
  {
    _id: '60d5ecb8b42f7c001f37e401',
    name: 'Faustini-PSR-07',
    lat: -87.32,
    lon: 65.18,
    area_km2: 77,
    description: 'A doubly shadowed PSR crater near the lunar south pole. Highly isolated thermal conditions make it a prime candidate for deep-subsurface ice accumulation.',
    iceZoneGeoJSON: {
      type: 'Feature',
      properties: {
        center: [-87.32, 65.18],
        radius_km: 8
      },
      geometry: {
        type: 'Point',
        coordinates: [65.18, -87.32]
      }
    },
    landingSite: { lat: -87.15, lon: 64.90 },
    roverPath: [
      { lat: -87.15, lon: 64.90 },
      { lat: -87.18, lon: 64.95 },
      { lat: -87.21, lon: 65.00 },
      { lat: -87.24, lon: 65.05 },
      { lat: -87.27, lon: 65.10 },
      { lat: -87.30, lon: 65.15 },
      { lat: -87.32, lon: 65.18 }
    ],
    elevationProfile: [
      { distance: 0, elevation: -2850 },
      { distance: 126, elevation: -2863 },
      { distance: 253, elevation: -2882 },
      { distance: 379, elevation: -2905 },
      { distance: 505, elevation: -2932 },
      { distance: 632, elevation: -2963 },
      { distance: 758, elevation: -2996 },
      { distance: 884, elevation: -3030 },
      { distance: 1011, elevation: -3063 },
      { distance: 1137, elevation: -3094 },
      { distance: 1263, elevation: -3122 },
      { distance: 1389, elevation: -3145 },
      { distance: 1516, elevation: -3162 },
      { distance: 1642, elevation: -3173 },
      { distance: 1768, elevation: -3178 },
      { distance: 1895, elevation: -3180 },
      { distance: 2021, elevation: -3180 },
      { distance: 2147, elevation: -3180 },
      { distance: 2274, elevation: -3180 },
      { distance: 2400, elevation: -3180 }
    ]
  },
  {
    _id: '60d5ecb8b42f7c001f37e402',
    name: 'Shackleton-PSR-02',
    lat: -89.90,
    lon: 0.00,
    area_km2: 120,
    description: 'Shackleton crater lies at the lunar South Pole. The peaks along its rim are exposed to almost continuous sunlight, while the interior is in permanent shadow.',
    iceZoneGeoJSON: {
      type: 'Feature',
      properties: {
        center: [-89.90, 0.00],
        radius_km: 12
      },
      geometry: {
        type: 'Point',
        coordinates: [0.00, -89.90]
      }
    },
    landingSite: { lat: -89.67, lon: 2.30 },
    roverPath: [
      { lat: -89.67, lon: 2.30 },
      { lat: -89.71, lon: 1.90 },
      { lat: -89.75, lon: 1.50 },
      { lat: -89.79, lon: 1.10 },
      { lat: -89.83, lon: 0.70 },
      { lat: -89.87, lon: 0.30 },
      { lat: -89.90, lon: 0.00 }
    ],
    elevationProfile: [
      { distance: 0, elevation: -2600 },
      { distance: 126, elevation: -2633 },
      { distance: 253, elevation: -2681 },
      { distance: 379, elevation: -2742 },
      { distance: 505, elevation: -2812 },
      { distance: 632, elevation: -2890 },
      { distance: 758, elevation: -2971 },
      { distance: 884, elevation: -3054 },
      { distance: 1011, elevation: -3134 },
      { distance: 1137, elevation: -3211 },
      { distance: 1263, elevation: -3281 },
      { distance: 1389, elevation: -3340 },
      { distance: 1516, elevation: -3382 },
      { distance: 1642, elevation: -3400 },
      { distance: 1768, elevation: -3400 },
      { distance: 1895, elevation: -3400 },
      { distance: 2021, elevation: -3400 },
      { distance: 2147, elevation: -3400 },
      { distance: 2274, elevation: -3400 },
      { distance: 2400, elevation: -3400 }
    ]
  }
];

const mockReports = [
  {
    _id: '60d5ecb8b42f7c001f37e499',
    craterId: {
      _id: '60d5ecb8b42f7c001f37e401',
      name: 'Faustini-PSR-07'
    },
    userId: '60d5ecb8b42f7c001f37e400',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    cpr_used: 1.34,
    dop_used: 0.090,
    iceVolume_m3: 2400000,
    confidence_interval: 300000,
    landingScore: 0.84,
    terrainSafety: {
      slope: 6.2,
      boulderDensity: 'Low',
      surfaceRoughness: 'Moderate',
      overallStatus: 'SAFE FOR LANDING'
    },
    status: 'completed'
  }
];

module.exports = {
  mockCraters,
  mockReports,
  mockUser: {
    id: '60d5ecb8b42f7c001f37e400',
    email: 'admin@galaxion.dev'
  }
};
