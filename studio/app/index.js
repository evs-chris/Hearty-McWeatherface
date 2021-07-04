import clock from "clock";
import { avg, singleTap, doubleTap, tripleTap, fill, find, kelvinToC, kelvinToF, keys, mToMi, mToF, msToMph, msToKph, skmToMs, mToKm, skmToSmi, formatSeconds, formatMilliseconds, zeroPad, monoDigits } from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import { battery } from "power";
import { me as device } from "device";
import * as fs from "fs";
import { me as app } from "appbit";
import * as messaging from "messaging";
import { today as activity, goals } from "user-activity";
import exercise from "exercise";
import { vibration } from "haptics";
import { display } from "display";

import { ui, eid, eclass } from './elements';

const MAIN = 1, HEARTL = 2, HEARTM = 3, HEARTS = 4, WEATHER = 5, STATS = 6, TIME = 7, EXERCISE = 8, TIMER = 9;
let page = MAIN;
let aodPage = 0;
let lastPage = 0;

const EXERCISE_INTERVAL = 500;

const ekgFile = "ekg-data.json";
const otherFile = "other.json";

let sw1 = 0;
let sw2 = 0;
let timer1 = 0;
let timer2 = 0;
let sw1Pause = 0;
let sw2Pause = 0;
let timer1Pause = 0;
let timer2Pause = 0;
let whichTimer = 0;
let timer1TM;
let timer2TM;
let statsTM;

let timer;

let settings = {};
let weather = {};

let exercising = (exercise.state !== 'stopped' && exercise.type) || exercise.state === 'started';
let pickExercise = 0;
let exerciseTM;
let beforeExercisePage = 0;
let exerciseLap = 1;

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const weatherIcon = {
  Rain: 'img/weather-rain.png',
  Clear: 'img/weather-sun.png',
  Drizzle: 'img/weather-drizzle.png',
  Snow: 'img/weather-snow.png',
  Thunderstorm: 'img/weather-thunderstorm.png',
  Clouds: 'img/weather-cloud.png',
  Fog: 'img/weather-fog.png',
  Mist: 'img/weather-fog.png',
  Smoke: 'img/weather-smoke.png',
  Haze: 'img/weather-smoke.png',
  Dust: 'img/weather-smoke.png',
  Ash: 'img/weather-smoke.png',
  Sand: 'img/weather-smoke.png',
  Squall: 'img/weather-thunder.png',
  Tornado: 'img/weather-tornado.png'
};
const exerciseIcon = {
  run: 'img/exercise-run.png',
  walk: 'img/exercise-walk.png',
  elliptical: 'img/exercise-elliptical.png',
  hiking: 'img/exercise-hike.png',
  treadmill: 'img/exercise-treadmill.png',
  cycling: 'img/exercise-cycle.png',
  spinning: 'img/exercise-spin.png',
  workout: 'img/exercise-workout.png'
};
const exercises = ['walk', 'run', 'cycling', 'workout', 'hiking', 'elliptical', 'treadmill', 'spinning'];

// Save state
app.onunload = () => {
  let data = JSON.stringify({ longs: ekg.longs, mids: ekg.mids, shorts: ekg.shorts, minMids: ekg.minMids, minLongs: ekg.minLongs, maxMids: ekg.maxMids, maxLongs: ekg.maxLongs });
  fs.writeFileSync(ekgFile, data, "json");
  data = JSON.stringify({ settings, weather, sw1, sw2, sw1Pause, sw2Pause, timer1, timer2, timer1Pause, timer2Pause });
  fs.writeFileSync(otherFile, data, "json");
}

// Init
const barWidth = ui.main.stepsBar.getBBox().width;

function switchPage(which) {
  // console.log(`switching to page ${which}`);
  page = which;
  draw();
}
function makeSwitchPage(which) {
  return () => switchPage(which);
}

eclass('heart-target').forEach((el, i) => {
  doubleTap(el, () => {
    if (i === 0) {
      ui.heart.long.l80.text = '2h 13\'';
      ui.heart.long.l60.text = '4h 26\'';
      ui.heart.long.l40.text = '6h 40\'';
      ui.heart.long.l20.text = '8h 48\'';
      switchPage(HEARTL);
    } else if (i === 1) {
      ui.heart.long.l80.text = '6\' 36"';
      ui.heart.long.l60.text = '13\' 12"';
      ui.heart.long.l40.text = '19\' 48"';
      ui.heart.long.l20.text = '26\' 24';
      switchPage(HEARTM);
    } else {
      ui.heart.long.l80.text = '0\' 20"';
      ui.heart.long.l60.text = '0\' 40"';
      ui.heart.long.l40.text = '1\' 0"';
      ui.heart.long.l20.text = '1\' 20';
      switchPage(HEARTS);
    }
  });
});

doubleTap(eid('weather-target'), makeSwitchPage(WEATHER));
doubleTap(eid('multi-target'), () => {
  if (exercising) {
    beforeExercisePage = 2;
    switchPage(EXERCISE);
  } else {
    switchPage(WEATHER);
  }
});
doubleTap(eid('stats-target'), makeSwitchPage(STATS));
doubleTap(eid('time-target'), makeSwitchPage(TIME));
doubleTap(ui.page.heartl, makeSwitchPage(MAIN));
doubleTap(ui.page.weather, makeSwitchPage(MAIN));
doubleTap(ui.page.stats, makeSwitchPage(MAIN));
doubleTap(ui.page.time, makeSwitchPage(MAIN));
doubleTap(ui.exercise.activeEl, makeSwitchPage(MAIN));
doubleTap(ui.page.timer, makeSwitchPage(TIME));

doubleTap(ui.exercise.bg, () => {
  if (exercising) switchPage(MAIN);
});

tripleTap(ui.weather.time, () => {
  getWeather(true);
});

singleTap(eid('stats-exercise'), () => {
  beforeExercisePage = 1;
  switchPage(EXERCISE);
});
singleTap(eid('time-sw1-start'), () => {
  if (!sw1) {
    sw1 = Date.now();
  } else if (sw1Pause) {
    sw1 = Date.now() - (sw1Pause - sw1);
    sw1Pause = 0;
  } else {
    sw1Pause = Date.now();
  }
  
  drawSW();
});

singleTap(eid('time-sw2-start'), () => {
  if (!sw2) {
    sw2 = Date.now();
  } else if (sw2Pause) {
    sw2 = Date.now() - (sw2Pause - sw2);
    sw2Pause = 0;
  } else {
    sw2Pause = Date.now();
  }
  
  drawSW();
});

singleTap(eid('time-sw1-reset'), () => {
  if (sw1Pause) {
    sw1 = 0;
    sw1Pause = 0;
    drawSW();
  }
});

singleTap(eid('time-sw2-reset'), () => {
  if (sw2Pause) {
    sw2 = 0;
    sw2Pause = 0;
    drawSW();
  }
});

singleTap(eid('time-tm1-start'), () => {
  if (!timer1) {
    whichTimer = 1;
    timer = { h: 0, m: 0, s: 0 };
    switchPage(TIMER);
  } else if (!timer1Pause) {
    timer1Pause = timer1 - Date.now();
    if (timer1TM) clearTimeout(timer1TM);
    timer1TM = 0;
  } else {
    timer1 = Date.now() + timer1Pause;
    timer1Pause = 0;
    initTimers();
  }
  
  drawSW();
});

singleTap(eid('time-tm2-start'), () => {
  if (!timer2) {
    whichTimer = 2;
    timer = { h: 0, m: 0, s: 0 };
    switchPage(TIMER);
  } else if (!timer2Pause) {
    timer2Pause = timer2 - Date.now();
    if (timer2TM) clearTimeout(timer2TM);
    timer2TM = 0;
  } else {
    timer2 = Date.now() + timer2Pause;
    timer2Pause = 0;
    initTimers();
  }
  
  drawSW();
});

singleTap(eid('time-tm1-reset'), () => {
  if (timer1Pause) {
    timer1 = 0;
    timer1Pause = 0;
    drawSW();
  }
});

singleTap(eid('time-tm2-reset'), () => {
  if (timer2Pause) {
    timer2 = 0;
    timer2Pause = 0;
    drawSW();
  }
});

singleTap(ui.exercise.pick.cancel, () => {
  if (beforeExercisePage === 1) switchPage(STATS);
  else switchPage(MAIN);
});
singleTap(ui.exercise.pick.ok, () => {
  if (exercise.state !== 'stopped') return;
  exercise.start(exercises[pickExercise]);
  exerciseLap = 1;
});
singleTap(ui.exercise.pick.left, () => {
  if (pickExercise === 0) pickExercise = exercises.length - 1;
  else pickExercise--;
  updateExercise();
});
singleTap(ui.exercise.pick.right, () => {
  if (pickExercise >= exercises.length - 1) pickExercise = 0;
  else pickExercise++;
  updateExercise();
});
singleTap(ui.exercise.active.stop, () => {
  if (exercise.state !== 'stopped') exercise.stop();
  exerciseLap = 0;
});
singleTap(ui.exercise.active.btn, () => {
  if (exercise.state === 'started') exercise.pause();
  else if (exercise.state === 'paused') exercise.resume();
});
singleTap(ui.exercise.active.lap, () => {
  if (exercise.state === 'started') {
    exercise.splitLap();
    exerciseLap++;
    updateExercise();
  }
})

function makeTimerChange(h, m, s) {
  return function() {
    timer.h += h;
    timer.m += m;
    timer.s += s;
    if (timer.s >= 60) {
      timer.m += Math.floor(timer.s / 60);
      timer.s = timer.s % 60;
    } else if (timer.s < 0) {
      timer.m += Math.floor(timer.s / 60);
      timer.s = 60 + timer.s % 60;
    }
    if (timer.m >= 60) {
      timer.h += Math.floor(timer.m / 60);
      timer.m = timer.m % 60;
    } else if (timer.m < 0) {
      timer.h += Math.floor(timer.m / 60);
      timer.m = 60 + timer.m % 60;
    }
    if (timer.h < 0) timer.h = 0;
    
    updateTimer();
  }
}

singleTap(ui.timer.hplus1, makeTimerChange(1, 0, 0));
singleTap(ui.timer.hplus5, makeTimerChange(5, 0, 0));
singleTap(ui.timer.hminus1, makeTimerChange(-1, 0, 0));
singleTap(ui.timer.hminus5, makeTimerChange(-5, 0, 0));

singleTap(ui.timer.mplus1, makeTimerChange(0, 1, 0));
singleTap(ui.timer.mplus5, makeTimerChange(0, 15, 0));
singleTap(ui.timer.mminus1, makeTimerChange(0, -1, 0));
singleTap(ui.timer.mminus5, makeTimerChange(0, -15, 0));

singleTap(ui.timer.splus1, makeTimerChange(0, 0, 1));
singleTap(ui.timer.splus5, makeTimerChange(0, 0, 15));
singleTap(ui.timer.sminus1, makeTimerChange(0, 0, -1));
singleTap(ui.timer.sminus5, makeTimerChange(0, 0, -15));

singleTap(ui.timer.ok, () => {
  const time = Date.now() + (timer.s + timer.m * 60 + timer.h * 3600) * 1000;
  if (whichTimer === 1) {
    timer1 = time;
    timer1Pause = 0;
  } else if (whichTimer === 2) {
    timer2 = time;
    timer2Pause = 0;
  }
  initTimers();
  switchPage(TIME);
});

singleTap(ui.timer.cancel, () => {
  switchPage(TIME);
})

ui.main.city.text = 'City';

// Heart
const base = 5000;
const step = 20;
let resting = user.restingHeartRate;
let minRate = resting;
let maxRate = resting;
let currentRate = '--';
let lastRate = 0;
const screenHeight = (device.screen || { height: 250 }).height;
const ekg = {
  longs: fill([], resting, 0, 20),
  mids: fill([], resting, 0, 20),
  shorts: fill([], resting, 0, 20),
  minMids: fill([], resting, 0, 20),
  minLongs: fill([], resting, 0, 20),
  maxMids: fill([], resting, 0, 20),
  maxLongs: fill([], resting, 0, 20),
  short: 0,
  mid: 0,
  long: 0,
  shortt: base,
  midt: base * step,
  longt: base * step * step
}

// load saved state
try {
  const json = JSON.parse(fs.readFileSync(ekgFile, "json"));
  const now = Date.now();

  if (json) {
    ekg.longs = json.longs || ekg.longs;
    ekg.mids = json.mids || ekg.mids;
    ekg.shorts = json.shorts || ekg.shorts;
    ekg.minMids = json.minMids || ekg.mids.slice();
    ekg.minLongs = json.minLongs || ekg.longs.slice();
    ekg.maxMids = json.maxMids || ekg.mids.slice();
    ekg.maxLongs = json.maxLongs || ekg.longs.slice();
  }
  
  // demo data
  /*ekg.minLongs = [ 88,  97,  85,  66,  54,  70,  72,  65,  61,  61,  63,  50,  54,  54,  55,  59,  52,  70,  74,  81];
  ekg.longs =    [ 97,  99,  88,  86,  71,  71,  72,  68,  69,  69,  65,  50,  56,  57,  56,  59,  63,  75,  80,  85];
  ekg.maxLongs = [102, 133, 100,  88,  78,  79,  92,  68,  69,  79,  67,  55,  58,  59,  59,  59,  78,  79, 169, 155];
  
  ekg.minMids =  [ 88,  88,  85,  80,  79,  84,  88,  90,  98,  98, 102, 110, 104, 104, 110, 110, 127, 117, 101,  96];
  ekg.mids =     [ 90,  88,  87,  88,  87,  87,  90,  96, 100, 110, 111, 110, 105, 109, 114, 120, 132, 120, 122, 110];
  ekg.maxMids =  [100,  99,  99,  95,  93,  94, 110, 120, 110, 115, 114, 130, 135, 149, 144, 130, 172, 121, 125, 111];
  
  ekg.shorts =   [110, 115, 112, 111, 110, 109, 110,  99,  98,  95,  93,  92,  93,  90,  85,  80,  82,  80,  79,  75];*/
  
  ekg.mid = now + ekg.midt;
  ekg.long = now + ekg.longt;
} catch (e) { console.error(e); }

try {
  const other = JSON.parse(fs.readFileSync(otherFile, "json"));
  if (other) {
    weather = other.weather || {};
    settings = other.settings || {};
    sw1 = other.sw1 || 0;
    sw2 = other.sw2 || 0;
    sw1Pause = other.sw1Pause || 0;
    sw2Pause = other.sw2Pause || 0;
    timer1 = other.timer1 || 0;
    timer2 = other.timer2 || 0;
    timer1Pause = other.timer1Pause || 0;
    timer2Pause = other.timer2Pause || 0;
  }
} catch (e) { console.error(e); }

function updateHeart() {
  if (!aodPage && page === MAIN) {
    ui.main.minRate.text = monoDigits(`${minRate}/${resting}`);
    ui.main.minRateShadow.text = ui.main.minRate.text;
    ui.main.maxRate.text = monoDigits(`${currentRate}/${maxRate}`);
    ui.main.maxRateShadow.text = ui.main.maxRate.text;
  }
}

let hrm;
const hrmError = () => {
  currentRate = '--';
  upateHeart();
  hrm.stop();
  setTimeout(() => {
    initHrm();
  }, 2500);
}
const hrmRead = () => {
  currentRate = hrm.heartRate;
  if (lastRate === hrm.timestamp) {
    currentRate = '--';
  }
  lastRate = hrm.timestamp;
  updateHeart();
  
  if (typeof currentRate !== 'number') return drawEKG();
  
  let bump = false;
  const now = Date.now();
  if (now > ekg.long) {
    ekg.longs.push(avg(ekg.mids) || resting || 60);
    if (ekg.longs.length > 20) ekg.longs.shift();
    ekg.minLongs.push(Math.min.apply(Math, ekg.minMids) || resting || 60);
    if (ekg.minLongs.length > 20) ekg.minLongs.shift();
    ekg.maxLongs.push(Math.max.apply(Math, ekg.maxMids) || resting || 60);
    if (ekg.maxLongs.length > 20) ekg.maxLongs.shift();
    bump = true;
    ekg.long = now + ekg.longt;
  }
  if (now > ekg.mid) {
    ekg.mids.push(avg(ekg.shorts) || resting || 60);
    if (ekg.mids.length > 20) ekg.mids.shift();
    ekg.minMids.push(Math.min.apply(Math, ekg.shorts) || resting || 60);
    if (ekg.minMids.length > 20) ekg.minMids.shift();
    ekg.maxMids.push(Math.max.apply(Math, ekg.shorts) || resting || 60);
    if (ekg.maxMids.length > 20) ekg.maxMids.shift();
    bump = true;
    ekg.mid = now + ekg.midt;
  }
  if (now > ekg.short) {
    bump = true;
    ekg.shorts.push(hrm.heartRate);
    if (ekg.shorts.length > 20) ekg.shorts.shift();
    ekg.short = now + ekg.shortt;
  }
  if (bump) drawEKG();
};
function initHrm() {
  hrm = new HeartRateSensor({ frequency: 2.5 });
  hrm.addEventListener('error', hrmError);
  hrm.addEventListener('reading', hrmRead);
  hrm.start();
}
initHrm();

exercise.onstatechange = () => {
  exercising = (exercise.state !== 'stopped' && exercise.type) || exercise.state === 'started';
  updateExercise();
  drawWeather();
};

setInterval(() => {
  resting = user.restingHeartRate;
}, 7200000);

function drawEKG() {
  if (!display.on) return;
  
  let lines, points, ekgHeight, offset, texts, ming, start, mins, maxes, ranges;
  const shadows = ui.heart.long.shadows;

  if (aodPage) {
    lines = ui.aod.lines;
    points = ekg.mids;
    mins = maxes = [];
    ekgHeight = Math.floor((screenHeight * 0.9) / 2);
    texts = [];
    ming = 10;
    offset = 20;
    start = ekg.longs[ekg.longs.length - 1];
  } else if (page === MAIN) {
    lines = ui.main.heart.lines;
    ranges = ui.main.heart.ranges;
    points = [].concat(ekg.longs.slice(3), ekg.mids.slice(3), ekg.shorts.slice(4));
    mins = [].concat(ekg.minLongs.slice(3), ekg.minMids.slice(3));
    maxes = [].concat(ekg.maxLongs.slice(3), ekg.maxMids.slice(3));
    ekgHeight = screenHeight / 2;
    offset = 20;
    texts = [];
    ming = 10;
    start = resting;
  } else if (page === HEARTL) {
    lines = ui.heart.long.lines;
    ranges = ui.heart.long.ranges;
    points = ekg.longs;
    mins = ekg.minLongs;
    maxes = ekg.maxLongs;
    ekgHeight = Math.round(screenHeight * 0.8);
    offset = 40;
    texts = ui.heart.long.texts;
    ming = 5;
    start = resting;
  } else if (page === HEARTM) {
    lines = ui.heart.long.lines;
    ranges = ui.heart.long.ranges;
    points = ekg.mids;
    mins = ekg.minMids;
    maxes = ekg.maxMids;
    ekgHeight = Math.round(screenHeight * 0.8);
    offset = 40;
    texts = ui.heart.long.texts;
    ming = 5;
    start = ekg.longs[ekg.longs.length - 1];
  } else if (page === HEARTS) {
    lines = ui.heart.long.lines;
    ranges = ui.heart.long.ranges;
    points = ekg.shorts;
    mins = maxes = [];
    ekgHeight = Math.round(screenHeight * 0.8);
    offset = 40;
    texts = ui.heart.long.texts;
    ming = 5;
    start = ekg.mids[ekg.mids.length - 1];
  }
  
  if (lines && points) {
    const min = minRate = Math.min.apply(Math, points.concat(start, mins));
    let max = maxRate = Math.max.apply(Math, points.concat(start, maxes));
    if (max - min < ming) max = min + ming;
    const unit = (ekgHeight - (2 * offset)) / (max - min);

    if (page !== MAIN && !aodPage) {
      ui.heart.long.min.text = minRate;
      ui.heart.long.max.text = maxRate;
    }

    points.reduce((a, c, i) => {
      lines[i].y1 = ekgHeight - (offset + ((a - min) * unit));
      lines[i].y2 = ekgHeight - (offset + ((c - min) * unit));
      if (texts[i]) {
        texts[i].text = shadows[i].text = c;
        texts[i].y = lines[i].y2 + (i % 2 === 0 ? 25 : -12);
        shadows[i].y = texts[i].y + 1;
      }
      return c;
    }, start);
    
    if (ranges) {
      mins.forEach((v, i) => {
        ranges[i].y1 = ekgHeight - (offset + ((Math.min(v, points[i]) - min) * unit));
        ranges[i].y2 = ekgHeight - (offset + ((Math.max(maxes[i], points[i]) - min) * unit));
      });
      if (!mins.length) {
        points.forEach((p, i) => {
          ranges[i].y1 = -1;
          ranges[i].y2 = -1;
        });
      }
    }
    
    updateHeart();
  }
}

function ordinal(num) {
  let str = `${num}`;
  str = `${str[1]}${str[0]}}`;
  if (str[1] == '1') return `${num}th`;
  else if (str[0] == '1') return `${num}st`;
  else if (str[0] == '2') return `${num}nd`;
  else if (str[0] == '3') return `${num}rd`;
  else return `${num}th`;
}

// Time
clock.granularity = "minutes";
function updateTimeCb(evt) {
  const today = evt.date;
  const hours = monoDigits((settings.time ? today.getHours() % 12 || 12 : zeroPad(today.getHours())) + ':');
  const minutes = monoDigits(zeroPad(today.getMinutes()));
  const date = monoDigits(`${today.getFullYear()}-${zeroPad(today.getMonth() + 1)}-${zeroPad(today.getDate())}`);
  
  if (aodPage) {
    const w = ui.aod;
    if (hours.length === 1) w.hour1.forEach(h => h.text = '');
    else w.hour1.text = w.hour1.forEach(h => h.text = hours[0]);
    w.hour2.forEach(h => h.text = hours[1]);

    w.minute1.forEach(m => m.text = minutes[0]);
    w.minute2.forEach(m => m.text = minutes[1]);

    w.date.text = date;

    drawEKG();
  } else if (page === MAIN) {
    ui.main.hours.text = hours;
    ui.main.minutes.text = minutes;
    ui.main.hoursShadow.text = hours;
    ui.main.minutesShadow.text = minutes;
    ui.main.date.text = date;
    ui.main.dateShadow.text = date;
    
    const day = today.getDay();
    ui.main.dayText.forEach((d, i) => {
      if (i == day) {
        d.style.opacity = 0.8;
        ui.main.dayBox[i].style.fill = 'blue';
        ui.main.dayBox[i].style.opacity = 0.6;
      } else {
        d.style.opacity = 0.2;
        ui.main.dayBox[i].style.fill = 'white';
        ui.main.dayBox[i].style.opacity = 0.1;
      }
    });
    
    if (exercising) updateExercise();
    
    if (sw1 && !sw1Pause || sw2 && !sw2Pause) ui.main.activeSw.style.display = 'inline';
    else ui.main.activeSw.style.display = 'none';
    
    if (timer1 && !timer1Pause || timer2 && !timer2Pause) ui.main.activeTm.style.display = 'inline';
    else ui.main.activeTm.style.display = 'none';
  } else if (!display.on || display.aodActive) {
    return;
  } else if (page === HEARTL) {
    ui.heart.long.time.text = `${hours}${minutes}`;
  } else if (page === HEARTM) {
    ui.heart.long.time.text = `${hours}${minutes}`;
  } else if (page === HEARTS) {
    ui.heart.long.time.text = `${hours}${minutes}`;
  } else if (page === WEATHER) {
    ui.weather.time.text = `${hours}${minutes}`;
  } else if (page === STATS) {
    ui.stats.time.text = `${hours}${minutes}`;
  } else if (page === TIME) {
    ui.time.time.text = `${hours}${minutes}`;
    ui.time.date.text = `${days[today.getDay()]}, ${months[today.getMonth()]} ${ordinal(today.getDate())} ${today.getFullYear()}`;
  } else if (page === EXERCISE) {
    ui.exercise.time.text = `${hours}${minutes}`;
  }
}
clock.ontick = updateTimeCb;
function updateTime() {
  updateTimeCb({ date: new Date() });
}

// Weather and settings
messaging.peerSocket.onmessage = function(evt) {
  console.log('app message');
  if (evt.data.type === 'settings') {
    settings = evt.data.value;
    updateColors();
    draw();
  } else if (evt.data.type === 'weather') {
    const val = evt.data.value || {};
    const key = evt.data.key;
    
    if (!weather.list) weather.list = [];
    
    if (typeof key === 'number') weather.list[key] = val;
    else {
      weather.city = val.city;
      weather.when = val.when;
      weather.loc = val.loc;
    }
    
    updateWeather();
  }
}

const queue = [];
function flushQueue() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    console.log('app flushing queue');
    queue.forEach(m => {
      console.log(`app sending ${JSON.stringify(m)}`);
      messaging.peerSocket.send(m);
    });
    queue.splice(0, queue.length);
  } else {
    console.log(`socket not ready for queue flush`);
  }
}
messaging.peerSocket.onopen = () => {
  console.log('app peer open');
  flushQueue();
}

messaging.peerSocket.onclose = () => {
  console.log('app peer closed');
}

messaging.peerSocket.onerror = e => {
  console.log('app peer error', e.message, e);
}

function getWeather(force) {
  if (!find(queue, m => m && m.type === 'weather')) queue.push({ type: 'weather', value: weather.when, force: force });
  flushQueue();
}
setInterval(getWeather, 1800000);

function windDir(num) {
  if (num < 23) return '↓';
  else if (num < 68) return '↙';
  else if (num < 113) return '←';
  else if (num < 158) return '↖';
  else if (num < 203) return '↑';
  else if (num < 248) return '↗';
  else if (num < 293) return '→';
  else if (num < 338) return '↘';
  else return '↓';
}

function updateWeather() {
  if (page === MAIN) {
    const w = ui.main;
    if (exercising) {
      w.weather2block.display = 'none';
      w.weather2block.layer = 1;
    } else {
      w.weather2block.display = 'inline';
      w.weather2block.layer = 3;
    }
    w.city.text = weather.city || 'unknown';
    const dt = weather.when ? new Date(weather.when) : new Date();
    let d = dt.getDay() + 1;
    if (d > 6) d = 0;
    w.weather1.text = days[d].substr(0, 3);
    d += 1;
    if (d > 6) d = 0;
    w.weather2.text = days[d].substr(0, 3);
    if (weather.list) {
      let list = weather.list;
      list = [list[0], list[1], list[2], list[3], list[5]];
      list.forEach((l, i) => {
        if (l) {
          const img = w.imgs[i], temp = w.temps[i], precip = w.precips[i], low = w.lows[i], high = w.highs[i];
          img.href = weatherIcon[l.desc] || '';
          temp.text = `${settings.temp ? kelvinToF(l.temp) : kelvinToC(l.temp)}°`;
          precip.height = Math.ceil(l.precip * 20);
          precip.y = img.y + (20 - precip.height);
          low.height = Math.min(20, Math.ceil((l.temp - l.min) * 4));
          low.y = img.y + (20 - low.height);
          high.height = Math.min(20, Math.ceil((l.max - l.temp) * 4));
          high.y = img.y + (20 - high.height);
          //ui.main.descs[i].text = l.desc;
        }
      });
    }
  } else if (page === EXERCISE && exercising) {
    const w = ui.exercise.active;
    if (weather.list) {
      let list = weather.list;
      list = [list[0], list[1]];
      list.forEach((l, i) => {
        if (l) {
          const img = w.imgs[i], temp = w.temps[i], precip = w.precips[i], low = w.lows[i], high = w.highs[i];
          img.href = weatherIcon[l.desc] || '';
          temp.text = `${settings.temp ? kelvinToF(l.temp) : kelvinToC(l.temp)}°`;
          precip.height = Math.ceil(l.precip * 20);
          precip.y = img.y + (20 - precip.height);
          low.height = Math.min(20, Math.ceil((l.temp - l.min) * 4));
          low.y = img.y + (20 - low.height);
          high.height = Math.min(20, Math.ceil((l.max - l.temp) * 4));
          high.y = img.y + (20 - high.height);
          //ui.main.descs[i].text = l.desc;
        }
      });
    }
  } else if (page === WEATHER) {
    const dt = new Date(weather.when || 0);
    ui.weather.when.text = `${dt.getFullYear()}-${zeroPad(dt.getMonth() + 1)}-${zeroPad(dt.getDate())} ${settings.time ? dt.getHours() % 12 || 12 : zeroPad(dt.getHours())}:${zeroPad(dt.getMinutes())}`;
    ui.weather.where.text = weather.city;
    (weather.list || []).forEach((w, i) => {
      if (i > 8) return;
      const d = new Date(w.when * 1000);
      ui.weather.whens[i].text = `${zeroPad(d.getMonth() + 1)}-${zeroPad(d.getDate())} ${settings.time ? d.getHours() % 12 || 12 : zeroPad(d.getHours())}`;
      //ui.weather.descs[i].text = w.desc;
      ui.weather.imgs[i].href = weatherIcon[w.desc] || '';
      ui.weather.feels[i].text = `${w.feel ? settings.temp ? kelvinToF(w.feel) : kelvinToC(w.feel) : '?'}°`
      ui.weather.precips[i].text = `${Math.ceil((w.precip || 0) * 100)}%`;
      ui.weather.temps[i].text = `${settings.temp ? kelvinToF(w.temp) : kelvinToC(w.temp)}°`
      ui.weather.hums[i].text = `${w.hum}%`;
      ui.weather.clouds[i].text = `${w.clouds}%`;
      ui.weather.winds[i].text = `${windDir(w.wind.deg)}${settings.temp ? msToMph(w.wind.speed).toFixed(1) : msToKph(w.wind.speed).toFixed(1)}`;
    })
  }
}

// Exercise
function updateExercise() {
  if (!display.on || display.aodActive) return;
  
  const ex = exercise;
  //const ex = { type: 'run', stats: { elevationGain: 113, speed: 5.49, calories: 1412, distance: 15115.5, steps: 16129, activeTime: 5978141 } };
  
  if (page === MAIN) {
    const w = ui.main.exercise;
    
    if (exercising) {
      w.main.style.display = 'inline';
      w.main.layer = 3;
      w.which.href = exerciseIcon[exercising] || exerciseIcon.workout;
      
      w.time.text = monoDigits(formatMilliseconds(ex.stats.activeTime, true));
      
      w.floors.text = monoDigits(`${settings.temp ? Math.round(mToF(ex.stats.elevationGain)) : ex.stats.elevationGain || 0}`);
      w.calories.text = monoDigits(`${ex.stats.calories || 0}`);
      w.steps.text = monoDigits(`${ex.stats.steps || 0}`);
      w.distance.text = monoDigits(`${settings.temp ? mToMi(ex.stats.distance || 0).toFixed(1) : mToKm(ex.stats.distance || 0).toFixed(1)}`);
      w.speed.text = monoDigits(`${settings.temp ? msToMph(ex.stats.speed.current).toFixed(1) : msToKph(ex.stats.speed.current).toFixed(1)}`);
    } else {
      w.main.style.dissplay = 'none';
      w.main.layer = 2;
    }
  } else if (page === EXERCISE) {
    const main = ui.exercise;
    
    if (ex.type && ex.stats && ex.state !== 'stopped') {
      main.activeEl.style.display = 'inline';
      main.activeEl.layer = 5;
      main.pickEl.style.display = 'none';
      main.pickEl.layer = 0;
      
      const w = main.active;
      w.which.href = (exerciseIcon[exercising] || exerciseIcon.workout).replace(/\.png/, '-big.png');
      if (ex.state === 'paused') w.btnImg.href = 'img/icons-play.png';
      else if (ex.state === 'started') w.btnImg.href = 'img/icons-pause.png';
      
      w.laps.text = `${exerciseLap}`;
      
      w.time.text = monoDigits(formatMilliseconds(ex.stats.activeTime, true));
      
      const speed = ex.type === 'biking' ? 17 : ex.type === 'running' ? 10 : 3.5;
      
      w.floors.text = monoDigits(`${settings.temp ? Math.round(mToF(ex.stats.elevationGain)) : ex.stats.elevationGain || 0}`);
      w.calories.text = monoDigits(`${ex.stats.calories || 0}`);
      w.steps.text = monoDigits(`${ex.stats.steps || 0}`);
      w.distance.text = `${settings.temp ? mToMi(ex.stats.distance || 0).toFixed(1) : mToKm(ex.stats.distance || 0).toFixed(1)}`;
      
      const paceMs = skmToMs(ex.stats.pace.current);
      w.pace.text = monoDigits(`${settings.temp ? formatSeconds(skmToSmi(ex.stats.pace.current)) : formatSeconds(ex.stats.pace.current)}`);
      w.paceo.sweepAngle = 180 - Math.floor(Math.min(1, paceMs / speed) * 180);
      w.paceAvg.text = monoDigits(`${settings.temp ? formatSeconds(skmToSmi(ex.stats.pace.average)) : formatSeconds(ex.stats.pace.average)}`);
      
      w.speed.text = monoDigits(`${settings.temp ? msToMph(ex.stats.speed.current).toFixed(1) : msToKph(ex.stats.speed.current).toFixed(1)}`);
      w.speedo.sweepAngle = Math.floor(Math.min(1, (ex.stats.speed.current || 0) / speed) * 180);
      w.speedAvg.text = monoDigits(`${settings.temp ? msToMph(ex.stats.speed.average).toFixed(1) : msToKph(ex.stats.speed.average).toFixed(1)}`);
      w.speedMax.text = monoDigits(`${settings.temp ? msToMph(ex.stats.speed.max).toFixed(1) : msToKph(ex.stats.speed.max).toFixed(1)}`);
      
      w.heart.text = monoDigits(`${ex.stats.heartRate.current || 0}`);
      w.hearto.sweepAngle = Math.floor(Math.min(1, (ex.stats.heartRate.current || 0) / 200) * 180);
      w.heartAvg.text = monoDigits(`${ex.stats.heartRate.average || 0}`);
      w.heartMax.text = monoDigits(`${ex.stats.heartRate.max || 0}`);
      
      if (exerciseTM) clearTimeout(exerciseTM);
      if (ex.state === 'started' && display.on && !display.aodActive) exerciseTM = setTimeout(updateExercise, EXERCISE_INTERVAL);
    } else {
      main.pickEl.style.display = 'inline';
      main.pickEl.layer = 5;
      main.activeEl.style.display = 'none';
      main.activeEl.layer = 0;
      
      const w = main.pick;
      w.which.href = (exerciseIcon[exercises[pickExercise]] || exerciseIcon.workout).replace(/\.png/, '-big.png');
    }
  }
}

// Stats
function updateStats() {
  if (!display.on || display.aodActive) return;
  
  const a = activity.local;
  const m = a.activeZoneMinutes || {};
  // demo
  //const m = { fatBurn: 0, cardio: 0, peak: 0, total: 0 };
  //const m = { fatBurn: 22, cardio: 37, peak: 13, total: 72 };
  
  const stepPct = Math.min(1, !a.steps ? 0 : (a.steps || 1) / (goals.steps || 1));
  const distPct = Math.min(1, !a.distance ? 0 : (a.distance || 1) / (goals.distance || 1));
  const actPct = Math.min(1, !m.total ? 0 : (m.total || 1) / ((goals.activeZoneMinutes || {}).total || 1));
  const calPct = Math.min(1, !a.calories ? 0 : (a.calories || 1) / (goals.calories || 1));
  const floorPct = Math.min(1, !a.elevationGain ? 0 : (a.elevationGain || 1) / (goals.elevationGain || 1));
  
  const fatPct = Math.min(1, !m.fatBurn ? 0 : (m.fatBurn || 1) / (m.total || 1));
  const cardioPct = Math.min(1, !m.cardio ? 0 : (m.cardio || 1) / (m.total || 1));
  const peakPct = Math.min(1, !m.peak ? 0 : (m.peak || 1) / (m.total || 1));
  
  if (page === MAIN) {
    const w = ui.main;
    w.steps.text = monoDigits(`${a.steps}`);
    w.stepsBar.width = Math.floor(stepPct * barWidth); w.stepsBar.x = barWidth - w.stepsBar.width;
    w.distance.text = monoDigits(`${settings.temp ? mToMi(a.distance) : mToKm(a.distance)}`);
    w.distanceBar.width = Math.floor(distPct * barWidth); w.distanceBar.x = barWidth - w.distanceBar.width;
    w.calories.text = monoDigits(`${a.calories}`);
    w.caloriesBar.width = Math.floor(calPct * barWidth); w.caloriesBar.x = barWidth - w.caloriesBar.width;
    w.floors.text = monoDigits(`${a.elevationGain}`);
    w.floorsBar.width = Math.floor(floorPct * barWidth); w.floorsBar.x = barWidth - w.floorsBar.width;
    w.activeMinutes.text = monoDigits(`${m.total || 0}`);
    w.activeMinutesBar.width = Math.floor(actPct * barWidth); w.activeMinutesBar.x = barWidth - w.activeMinutesBar.width;

    const twidth = w.activeMinutesBar.width;

    if (m.fatBurn) {
      w.activeFatburnBar.width = Math.floor(fatPct * twidth);
      w.activeFatburnBar.x = w.activeMinutesBar.x;
    } else w.activeFatburnBar.width = 0;
    if (m.cardio) {
      w.activeCardioBar.width = Math.ceil(cardioPct * twidth);
      w.activeCardioBar.x = w.activeFatburnBar.x + w.activeFatburnBar.width;
    } else w.activeCardioBar.width = 0;
    if (m.peak) {
      w.activePeakBar.width = twidth - w.activeCardioBar.width - w.activeFatburnBar.width;
      w.activePeakBar.x = w.activeCardioBar.x + w.activeCardioBar.width;
    } else w.activePeakBar.width = 0;
  } else if (page === STATS) {
    const w = ui.stats;
    w.pct.step.sweepAngle = stepPct * 360;
    w.pct.dist.sweepAngle = distPct * 360;
    w.pct.active.sweepAngle = actPct * 360;
    w.pct.cal.sweepAngle = calPct * 360;
    w.pct.floor.sweepAngle = floorPct * 360;
    
    w.amt.step.text = monoDigits(`${a.steps}`);
    w.amt.dist.text = monoDigits(`${settings.temp ? mToMi(a.distance) : mToKm(a.distance)}`);
    w.amt.active.text = monoDigits(`${m.total || 0}`);
    w.amt.cal.text = monoDigits(`${a.calories}`);
    w.amt.floor.text = monoDigits(`${a.elevationGain}`);
    
    /*const mg = goals.activeZoneMinutes || {};
    const fatPct = Math.min(1, !m.fatBurn ? 0 : (m.fatBurn || 1) / (mg.fatBurn || m.total || 1));
    const cardioPct = Math.min(1, !m.cardio ? 0 : (m.cardio || 1) / (mg.cardio || m.total || 1));
    const peakPct = Math.min(1, !m.peak ? 0 : (m.peak || 1) / (mg.peak || m.total || 1));
    
    w.pct.fatburn.sweepAngle = fatPct * 360;
    w.pct.cardio.sweepAngle = cardioPct * 360;
    w.pct.peak.sweepAngle = peakPct * 360;*/
    
    w.pct.fatburn.startAngle = 90;
    w.pct.fatburn.sweepAngle = fatPct * 360;
    w.pct.cardio.startAngle = w.pct.fatburn.sweepAngle + 90;
    w.pct.cardio.sweepAngle = cardioPct * 360;
    w.pct.peak.startAngle = w.pct.cardio.startAngle + w.pct.cardio.sweepAngle;
    w.pct.peak.sweepAngle = peakPct * 360;
    
    w.amt.fatburn.text = monoDigits(`${m.fatBurn || 0}`);
    w.amt.cardio.text = monoDigits(`${m.cardio || 0}`);
    w.amt.peak.text = monoDigits(`${m.peak || 0}`);
  }
  
  if (exercising) updateExercise();
}

// Battery
function updateBattery() {
  const level = `${zeroPad(battery.chargeLevel)}%`;
  if (page === MAIN) ui.main.battery.text = level;
  else if (page === HEARTL || page === HEARTM || page === HEARTS) ui.heart.long.battery.text = level;
  else if (page === WEATHER) ui.weather.battery.text = level;
  else if (page === STATS) ui.stats.battery.text = level;
  else if (page === TIME) ui.time.battery.text = level;
  else if (page === EXERCISE) ui.exercise.battery.text = level;
}
battery.onchange = updateBattery;

// Pages
function draw() {
  requestAnimationFrame(_draw);
}
// assumes a square screen, which holds for now
const maxOffset = Math.floor(screenHeight * 0.1);
function _draw() {
  if (display.aodActive && !aodPage) {
    aodPage = page;
    ui.aod.wrapper.x = ui.aod.wrapper.y = Math.floor(Math.random() * maxOffset);
    ui.page.aod.style.display = "inline";
    ui.page.aod.layer = 100;
    updateTime();
    return;
  } else if (!display.aodActive && aodPage) {
    aodPage = 0;
    ui.page.aod.style.display = 'none';
    ui.page.aod.layer = 0;
  }

  if (page !== lastPage) {
    for (const p in ui.page) {
      ui.page[p].style.display = 'none';
      ui.page[p].layer = 0;
    }

      if (page === MAIN) {
      ui.page.main.style.display = 'inline';
      ui.page.main.layer = 20;
    } else if (page === HEARTL) {
      ui.page.heartl.style.display = 'inline';
      ui.page.heartl.layer = 20;
    } else if (page === HEARTM) {
      ui.page.heartl.style.display = 'inline';
      ui.page.heartl.layer = 20;
    } else if (page === HEARTS) {
      ui.page.heartl.style.display = 'inline';
      ui.page.heartl.layer = 20;
    } else if (page === WEATHER) {
      ui.page.weather.style.display = 'inline';
      ui.page.weather.layer = 20;
    } else if (page === STATS) {
      ui.page.stats.style.display = 'inline';
      ui.page.stats.layer = 20;
    } else if (page === TIME) {
      ui.page.time.style.display = 'inline';
      ui.page.time.layer = 20;
    } else if (page === EXERCISE) {
      ui.page.exercise.style.display = 'inline';
      ui.page.exercise.layer = 20;
    } else if (page === TIMER) {
      ui.page.timer.style.display = 'inline';
      ui.page.timer.layer = 20;
    }
    
    lastPage = page;
  }
  
  if (page === MAIN) drawMain();
  else if (page === HEARTL) drawHeart(0);
  else if (page === HEARTM) drawHeart(1);
  else if (page === HEARTS) drawHeart(2);
  else if (page === WEATHER) drawWeather();
  else if (page === STATS) drawStats();
  else if (page === TIME) drawTime();
  else if (page === EXERCISE) drawExercise();
  else if (page === TIMER) drawTimer();
  
  updateTime();
  updateBattery();
}

function drawMain() {
  updateStats();
  updateWeather();
  updateExercise();
  drawEKG();
}

function drawHeart() {
  drawEKG();
}

function drawWeather() {
  updateWeather();
}

function drawStats() {
  updateStats();
  updateExercise();
}

function drawTime() {
  drawSW(true);
}

function drawExercise() {
  updateExercise();
  updateWeather();
}

function drawTimer() {
  updateTimer();
}

// Stopwatch
function timeStr(ms) {
  let str = `${ms}`.substr(-3, 3);
  if (ms < 1000) return `0.${str}`;
  let s = '' + ms;
  s = +(s.substr(0, s.length - 3));
  let n = s % 60;
  str = `${zeroPad(n)}" ${str}`;
  if (s < 60) return str;
  s -= n;
  s = s / 60;
  n = s % 60;
  if (s > 0) str = `${zeroPad(n)}' ${str}`;
  s -= n;
  s = s / 60;
  n = s % 24;
  if (s > 0) str = `${zeroPad(n)}h ${str}`;
  s -= n;
  s = s / 24;
  if (s > 0) str = `${s}d ${str}`;
  return str;
}

function drawSW(init) {
  if (!display.on || display.aodActive) return;

  const now = Date.now();
  
  if (sw1 && !sw1Pause) ui.time.sw1.text = monoDigits(timeStr(now - sw1));
  else if (!sw1) ui.time.sw1.text = monoDigits(timeStr(0));
  else if (init && sw1Pause) ui.time.sw1.text = monoDigits(timeStr(sw1Pause - sw1));
  
  if (sw2 && !sw2Pause) ui.time.sw2.text = monoDigits(timeStr(now - sw2));
  else if (!sw2) ui.time.sw2.text = monoDigits(timeStr(0));
  else if (init && sw2Pause) ui.time.sw2.text = monoDigits(timeStr(sw2Pause - sw2));
  
  if (timer1Pause === -1) ; // just finished
  else if (timer1 > now && !timer1Pause) ui.time.tm1.text = monoDigits(timeStr(timer1 - now));
  else if (timer1 && timer1Pause) ui.time.tm1.text = monoDigits(timeStr(timer1Pause));
  else if (!timer1 || timer1 < now) ui.time.tm1.text = '---';
  else if (init && timer1Pause) ui.time.tm1.text = monoDigits(timeStr(timer1Pause));
  
  if (timer2Pause === -1) ; // just finished
  else if (timer2 > now && !timer2Pause) ui.time.tm2.text = monoDigits(timeStr(timer2 - now));
  else if (timer2 && timer2Pause) ui.time.tm2.text = monoDigits(timeStr(timer2Pause));
  else if (!timer2 || timer2 < now) ui.time.tm2.text = '---';
  else if (init && timer2Pause) ui.time.tm2.text = monoDigits(timeStr(timer2Pause));
  
  if (page === TIME && ((sw1 && !sw1Pause) || (sw2 && !sw2Pause) || (timer1 && !timer1Pause) || (timer2 && !timer2Pause))) requestAnimationFrame(drawSW);
}

function updateTimer() {
  if (page === TIMER) {
    ui.timer.time.text = monoDigits(`${zeroPad(timer.h)}:${zeroPad(timer.m)}:${zeroPad(timer.s)}`);
  }
}

function updateColors() {
  ui.main.hours.style.fill = settings.hourColor || 'white';
  ui.main.minutes.style.fill = settings.minuteColor || 'blue';
  ui.main.maxRate.style.fill = settings.heartrateColor || 'red';
  ui.main.minRate.style.fill = settings.heartrateColor || 'red';
  eclass('ekg-line').forEach(l => l.style.fill = settings.graphColor || 'lightgreen');
  eclass('ekg-range').forEach(l => l.style.fill = settings.graphColor || 'lightgreen');
}

function initTimers() {
  const now = Date.now();
  if (timer1TM) clearTimeout(timer1TM);
  if (timer2TM) clearTimeout(timer2TM);
  if (timer1 && timer1 > now && !timer1Pause) timer1TM = setTimeout(() => {
    timer1 = 0;
    timer1Pause = -1;
    vibration.start('alert');
    display.poke();
    switchPage(TIME);
    ui.time.tm1.text = '-+-+-+-+-+-';
    setTimeout(() => {
      vibration.stop();
      timer1Pause = 0;
      ui.time.tm1.text = '---';
    }, 5000);
  }, timer1 - now);
  if (timer2 && timer2 > now && !timer2Pause) timer2TM = setTimeout(() => {
    timer2 = 0;
    timer2Pause = -1;
    vibration.start('alert');
    display.poke();
    switchPage(TIME)
    ui.time.tm2.text = '-+-+-+-+-+-';
    setTimeout(() => {
      vibration.stop();
      timer2Pause = 0;
      ui.time.tm2.text = '---';
    }, 5000);
  }, timer2 - now)
}

if (app.permissions.granted('access_aod')) {
  display.aodAllowed = true;
}

display.addEventListener('change', () => {
  if (display.on && !statsTM) statsTM = setInterval(updateStats, 5000);
  else if (!display.on && statsTM) {
    clearInterval(statsTM);
    statsTM = 0;
  }
  if (display.on) _draw();
});

if (display.on) statsTM = setInterval(updateStats, 5000);

// Init view
updateColors();
draw();
getWeather();
initTimers();
