import document from 'document';

export function eid(id) {
  return document.getElementById(id);
}

export function eclass(name) {
  return document.getElementsByClassName(name);
}

export const ui = {
  page: {
    aod: eid('aod'),
    main: eid('main'),
    heartl: eid('heart-long'),
    weather: eid('weather'),
    stats: eid('stats'),
    time: eid('time'),
    exercise: eid('exercise'),
    water: eid('water'),
    timer: eid('timer')
  },
  aod: {
    wrapper: eid('aod-wrapper'),
    hour1: eclass('aod-hour1'),
    hour2: eclass('aod-hour2'),
    minute1: eclass('aod-minute1'),
    minute2: eclass('aod-minute2'),
    date: eid('aod-date'),
    lines: eclass('aod-ekg-line'),
  },
  main: {
    hours: eid("hours"),
    minutes: eid("minutes"),
    hoursShadow: eid("hours-shadow"),
    minutesShadow: eid("minutes-shadow"),
    date: eid("date"),
    dateShadow: eid('date-shadow'),
    battery: eid("battery"),
    steps: eid("steps"),
    stepsBar: eid("steps-bar"),
    floors: eid("floors"),
    floorsBar: eid("floors-bar"),
    calories: eid("calories"),
    caloriesBar: eid("calories-bar"),
    distance: eid("distance"),
    distanceBar: eid("distance-bar"),
    activeMinutes: eid("active-minutes"),
    activeMinutesBar: eid("active-minutes-bar"),
    activeFatburnBar: eid('active-fatburn-bar'),
    activeCardioBar: eid('active-cardio-bar'),
    activePeakBar: eid('active-peak-bar'),
    minRate: eid("min-rate"),
    minRateShadow: eid("min-rate-shadow"),
    maxRate: eid("max-rate"),
    maxRateShadow: eid("max-rate-shadow"),
    city: eid("city"),
    dayText: eclass("day-text"),
    dayBox: eclass("day-box"),
    heart: {
      lines: eclass('ekg-line-main'),
      ranges: eclass('ekg-range')
    },
    weather: eid('weather'),
    temps: eclass('main-temp'),
    descs: eclass('main-desc'),
    imgs: eclass('weather-img'),
    precips: eclass('weather-precip-bar'),
    lows: eclass('weather-low-bar'),
    highs: eclass('weather-high-bar'),
    stats: eid('stats'),
    weather2block: eid('main-weather-2'),
    weather1: eid('weather-plus1'),
    weather2: eid('weather-plus2'),
    exercise: {
      main: eid('main-exercise'),
      which: eid('main-exercise-icon'),
      steps: eid('main-exercise-steps'),
      calories: eid('main-exercise-calories'),
      distance: eid('main-exercise-distance'),
      floors: eid('main-exercise-floors'),
      time: eid('main-exercise-time'),
      speed: eid('main-exercise-speed')
    },
    activeTm: eid('active-tm'),
    activeSw: eid('active-sw')
  },
  heart: {
    long: {
      min: eid('ekg-l-min'),
      max: eid('ekg-l-max'),
      lines: eclass('ekg-line-l'),
      texts: eclass('ekg-text-l'),
      shadows: eclass('ekg-text-shadow'),
      ranges: eclass('ekg-range-l'),
      time: eid('heart-long-time'),
      battery: eid('heart-long-battery'),
      l20: eid('heart-20'),
      l40: eid('heart-40'),
      l60: eid('heart-60'),
      l80: eid('heart-80')
    }
  },
  weather: {
    time: eid('weather-time'),
    battery: eid('weather-battery'),
    where: eid('weather-where'),
    when: eid('weather-when'),
    whens: eclass('weather-when'),
    feels: eclass('weather-feel'),
    precips: eclass('weather-precip'),
    temps: eclass('weather-temp'),
    clouds: eclass('weather-cloud'),
    hums: eclass('weather-hum'),
    descs: eclass('weather-desc'),
    imgs: eclass('weather-dimg'),
    winds: eclass('weather-wind')
  },
  stats: {
    time: eid('stats-time'),
    battery: eid('stats-battery'),
    pct: {
      step: eid('step-pct'),
      floor: eid('floor-pct'),
      dist: eid('dist-pct'),
      active: eid('active-pct'),
      cal: eid('cal-pct'),
      fatburn: eid('fatburn-pct'),
      cardio: eid('cardio-pct'),
      peak: eid('peak-pct')
    },
    amt: {
      step: eid('step-amt'),
      floor: eid('floor-amt'),
      dist: eid('dist-amt'),
      active: eid('active-amt'),
      cal: eid('cal-amt'),
      fatburn: eid('fatburn-amt'),
      cardio: eid('cardio-amt'),
      peak: eid('peak-amt')
    },
    goal: {
      step: eid('step-goal'),
      floor: eid('floor-goal'),
      dist: eid('dist-goal'),
      active: eid('active-goal'),
      cal: eid('cal-goal'),
      fatburn: eid('fatburn-goal'),
      cardio: eid('cardio-goal'),
      peak: eid('peak-goal')
    },
    exercise: eid('stats-exercise'),
    water: {
      wrapper: eid('stat-water-wrapper'),
      button: eid('stats-water'),
      back: eid('stat-water-back'),
      bar: eid('stat-water'),
      text: eid('stat-water-text'),
      goal: eid('stat-water-goal'),
    },
  },
  time: {
    battery: eid('time-battery'),
    time: eid('time-time'),
    date: eid('time-date'),
    sw1: eid('time-sw1'),
    sw2: eid('time-sw2'),
    tm1: eid('time-tm1'),
    tm2: eid('time-tm2')
  },
  exercise: {
    bg: eid('exercise-bg'),
    activeEl: eid('exercise-active'),
    pickEl: eid('exercise-pick'),
    battery: eid('exercise-battery'),
    time: eid('exercise-clock'),
    active: {
      which: eid('exercise-active-icon'),
      stop: eid('exercise-stop'),
      btn: eid('exercise-btn'),
      btnImg: eid('exercise-btn-img'),
      lap: eid('exercise-lap'),
      laps: eid('exercise-laps'),
      
      time: eid('exercise-time'),
      floors: eid('exercise-floors'),
      calories: eid('exercise-calories'),
      speed: eid('exercise-speed'),
      distance: eid('exercise-distance'),
      steps: eid('exercise-steps'),
      
      speedo: eid('exercise-speedo'),
      speedAvg: eid('exercise-speed-avg'),
      speedMax: eid('exercise-speed-max'),
      
      heart: eid('exercise-heart'),
      hearto: eid('exercise-hearto'),
      heartAvg: eid('exercise-heart-avg'),
      heartMax: eid('exercise-heart-max'),
      zone: {
        normal: eid('exercise-heart-normal'),
        normalLine: eid('exercise-heart-normal-line'),
        fatburn: eid('exercise-heart-fatburn'),
        fatburnLine: eid('exercise-heart-fatburn-line'),
        cardio: eid('exercise-heart-cardio'),
        cardioLine: eid('exercise-heart-cardio-line'),
        peak: eid('exercise-heart-peak'),
        peakLine: eid('exercise-heart-peak-line'),
      },
      
      pace: eid('exercise-pace'),
      paceo: eid('exercise-paceo'),
      paceAvg: eid('exercise-pace-avg'),
      
      temps: eclass('exercise-temp'),
      descs: eclass('exercise-desc'),
      imgs: eclass('exercise-weather-img'),
      precips: eclass('exercise-precip-bar'),
      lows: eclass('exercise-low-bar'),
      highs: eclass('exercise-high-bar'),
    },
    pick: {
      which: eid('exercise-pick-icon'),
      left: eid('exercise-left'),
      right: eid('exercise-right'),
      ok: eid('exercise-ok'),
      cancel: eid('exercise-cancel')
    }
  },
  water: {
    oz8: eid('water-pick-8'),
    oz12: eid('water-pick-12'),
    oz16: eid('water-pick-16'),
    oz20: eid('water-pick-20'),
    oz32: eid('water-pick-32'),
    cancel: eid('water-cancel'),
  },
  timer: {
    time: eid('timer-time'),
    hplus1: eid('timer-h-p1'),
    hplus5: eid('timer-h-p5'),
    hminus1: eid('timer-h-m1'),
    hminus5: eid('timer-h-m5'),
    mplus1: eid('timer-m-p1'),
    mplus5: eid('timer-m-p5'),
    mminus1: eid('timer-m-m1'),
    mminus5: eid('timer-m-m5'),
    splus1: eid('timer-s-p1'),
    splus5: eid('timer-s-p5'),
    sminus1: eid('timer-s-m1'),
    sminus5: eid('timer-s-m5'),
    ok: eid('timer-ok'),
    cancel: eid('timer-cancel')
  }
};
