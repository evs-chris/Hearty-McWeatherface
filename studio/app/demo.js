export const ekg = {
  minLongs: [ 88,  97,  85,  66,  54,  70,  72,  65,  61,  61,  63,  50,  54,  54,  55,  59,  52,  70,  74,  81],
  longs:    [ 97,  99,  88,  86,  71,  71,  72,  68,  69,  69,  65,  50,  56,  57,  56,  59,  63,  75,  80,  85],
  maxLongs: [102, 133, 100,  88,  78,  79,  92,  68,  69,  79,  67,  55,  58,  59,  59,  59,  78,  79, 169, 155],

  minMids:  [ 88,  88,  85,  80,  79,  84,  88,  90,  98,  98, 102, 110, 104, 104, 110, 110, 127, 117, 101,  96],
  mids:     [ 90,  88,  87,  88,  87,  87,  90,  96, 100, 110, 111, 110, 105, 109, 114, 120, 132, 120, 122, 110],
  maxMids:  [100,  99,  99,  95,  93,  94, 110, 120, 110, 115, 114, 130, 135, 149, 144, 130, 172, 121, 125, 111],

  shorts:   [110, 115, 112, 111, 110, 109, 110,  99,  98,  95,  93,  92,  93,  90,  85,  80,  82,  80,  79,  75],
};

export const stats = {
  steps: 6942,
  distance: 4545,
  calories: 1420,
  elevationGain: 8,
  activeZoneMinutes: {
    fatBurn: 10, cardio: 7, peak: 4, total: 21,
  },
};

export const goals = {
  steps: 10100,
  distance: 5000,
  calories: 3000,
  elevationGain: 10,
  activeZoneMinutes: {
    fatBurn: 20, cardio: 5, peak: 0, total: 20,
  },
};

export const exercise = {
  state: 'stopped',
  type: 'run',
  stats: {
    steps: 1621,
    elevationGain: 37,
    speed: {
      current: 2.5,
      average: 2.0,
      max: 3.2,
    },
    pace: {
      current: 563,
      average: 602,
      max: 671,
    },
    heartRate: {
      current: 122,
      average: 108,
      max: 177,
    },
    calories: 308,
    distance: 1500,
    activeTime: 2978141.
  }
};

export const water = {
  amount: 730,
  goal: 2290
};

export const weather = {
  city: 'Demo City',
  when: Date.now() - 3600000,
  list: [
    { temp: 292.61, feel: 292.75, precip: 0.05, desc: 'Clear', min: 290.27, max: 292.61, hum: 82, when: 1625475600, clouds: 0, wind: { speed: 1.06, deg: 89, gust: 1.11 } },
    { temp: 293.8, feel: 293.77, precip: 0.23, desc: 'Clouds', min: 291.8, max: 296.31, hum: 71, when: 1625486400, clouds: 0, wind: { speed: 1.08, deg: 93, gust: 1.77 } },
    { temp: 302.69, feel: 302.13, precip: 0.88, desc: 'Rain', min: 302.69, max: 302.69, hum: 38, when: 1625497200, clouds: 1, wind: { speed: 2.02, deg: 95, gust: 3.26 } },
    { temp: 302.83, feel: 304.51, precip: 0.42, desc: 'Drizzle', min: 302.83, max: 302.83, hum: 55, when: 1625583600, clouds: 96, wind: { speed: 1.16, deg: 61, gust: 1.21 } },
    { temp: 302.61, feel: 304.16, precip: 0, desc: 'Thunderstorm', min: 302.61, max: 302.61, hum: 55, when: 1625605200, clouds: 85, wind: { speed: 2.48, deg: 162, gust: 4.72 } },
    { temp: 295.43, feel: 296.01, precip: 0.45, desc: 'Fog', min: 295.43, max: 295.43, hum: 88, when: 1625670000, clouds: 100, wind: { speed: 3.64, deg: 69, gust: 7.5 } },
    { temp: 294.54, feel: 295.24, precip: 0.3, desc: 'Snow', min: 294.54, max: 294.54, hum: 96, when: 1625691600, clouds: 100, wind: { speed: 3.46, deg: 38, gust: 8.4 } },
    { temp: 301, feel: 302.82, precip: 0, desc: 'Smoke', min: 301, max: 301, hum: 64, when: 1625756400, clouds: 100, wind: { speed: 1.09, deg: 284, gust: 1.56 } },
    { temp: 303.23, feel: 305.36, precip: 0.04, desc: 'Tornado', min: 303.23, max: 303.23, hum: 56, when: 1625778000, clouds: 100, wind: { speed: 3.47, deg: 261, gust: 6.8 } },
  ],
};

export const demo = {
  ekg, exercise, goals, stats, water, weather
};