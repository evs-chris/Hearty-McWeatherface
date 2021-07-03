import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import { avg, doubleTap, tripleTap, fill, find, kelvinToC, kelvinToF, keys, mToMi, zeroPad } from "../common/utils";
import { HeartRateSensor } from "heart-rate";
import { user } from "user-profile";
import { battery } from "power";
import { me as device } from "device";
import * as fs from "fs";
import { me as app } from "appbit";
import * as messaging from "messaging";
import { today as activity, goals } from "user-activity";

const MAIN = 1, HEARTL = 2, HEARTM = 3, HEARTS = 4, WEATHER = 5, STATS = 6, TIME = 7;
let page = MAIN;

const ekgFile = "ekg-data.json";
const otherFile = "other.json";
let sw1 = 0;
let sw2 = 0;
let sw1Pause = 0;
let sw2Pause = 0;
let settings = {};
let weather = {};

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

// Save state
app.onunload = () => {
  let data = JSON.stringify({ longs: ekg.longs, mids: ekg.mids, shorts: ekg.shorts });
  fs.writeFileSync(ekgFile, data, "json");
  data = JSON.stringify({ settings, weather, sw1, sw2, sw1Pause, sw2Pause });
  fs.writeFileSync(otherFile, data, "json");
}

function eid(id) {
  return document.getElementById(id);
}

function eclass(name) {
  return document.getElementsByClassName(name);
}

// Init
const ui = {
  page: {
    main: eid('main'),
    heartl: eid('heart-long'),
    weather: eid('weather'),
    stats: eid('stats'),
    time: eid('time')
  },
  main: {
    hours: eid("hours"),
    minutes: eid("minutes"),
    hoursShadow: eid("hours-shadow"),
    minutesShadow: eid("minutes-shadow"),
    date: eid("date"),
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
    maxRate: eid("max-rate"),
    city: eid("city"),
    dayText: eclass("day-text"),
    dayBox: eclass("day-box"),
    heart: {
      lines: eclass('ekg-line-main')
    },
    weather: eid('weather'),
    temps: eclass('main-temp'),
    descs: eclass('main-desc'),
    imgs: eclass('weather-img'),
    precips: eclass('weather-precip-bar'),
    lows: eclass('weather-low-bar'),
    highs: eclass('weather-high-bar'),
    stats: eid('stats'),
    weather1: eid('weather-plus1'),
    weather2: eid('weather-plus2')
  },
  heart: {
    long: {
      lines: eclass('ekg-line-l'),
      texts: eclass('ekg-text-l'),
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
    }
  },
  time: {
    battery: eid('time-battery'),
    time: eid('time-time'),
    date: eid('time-date'),
    sw1: eid('time-sw1'),
    sw2: eid('time-sw2')
  }
};

const barWidth = ui.main.stepsBar.getBBox().width;

document.getElementsByClassName('heart-target').forEach((el, i) => {
  doubleTap(el, () => {
    ui.page.heartl.style.display = 'inline';
    ui.page.heartl.layer = 11;
    ui.page.main.style.display = 'none';
    
    if (i === 0) {
      page = HEARTL;
      ui.heart.long.l80.text = '2h 13\'';
      ui.heart.long.l60.text = '4h 26\'';
      ui.heart.long.l40.text = '6h 40\'';
      ui.heart.long.l20.text = '8h 48\'';
    } else if (i === 1) {
      page = HEARTM;
      ui.heart.long.l80.text = '6\' 36"';
      ui.heart.long.l60.text = '13\' 12"';
      ui.heart.long.l40.text = '19\' 48"';
      ui.heart.long.l20.text = '26\' 24';
    } else {
      page = HEARTS;
      ui.heart.long.l80.text = '0\' 20"';
      ui.heart.long.l60.text = '0\' 40"';
      ui.heart.long.l40.text = '1\' 0"';
      ui.heart.long.l20.text = '1\' 20';
    }
    
    draw();
  });
});

doubleTap(document.getElementById('weather-target'), () => {
  ui.page.weather.style.display = 'inline';
  ui.page.weather.layer = 11;
  ui.page.main.style.display = 'none';
  page = WEATHER;
  draw();
});

doubleTap(document.getElementById('stats-target'), () => {
  ui.page.stats.style.display = 'inline';
  ui.page.stats.layer = 11;
  ui.page.main.style.display = 'none';
  page = STATS;
  draw();
});

doubleTap(document.getElementById('time-target'), () => {
  ui.page.time.style.display = 'inline';
  ui.page.time.layer = 11;
  ui.page.main.style.display = 'none';
  page = TIME;
  draw();
});

doubleTap(ui.page.heartl, () => {
  ui.page.heartl.style.display = 'none';
  ui.page.heartl.layer = 0;
  ui.page.main.style.display = 'inline';
  page = MAIN;
  draw();
});

doubleTap(ui.page.weather, () => {
  ui.page.weather.style.display = 'none';
  ui.page.weather.layer = 3;
  ui.page.main.style.display = 'inline';
  page = MAIN;
  draw();
});

doubleTap(ui.page.stats, () => {
  ui.page.stats.style.display = 'none';
  ui.page.stats.layer = 4;
  ui.page.main.style.display = 'inline';
  page = MAIN;
  draw();
});

doubleTap(ui.page.time, () => {
  ui.page.time.style.display = 'none';
  ui.page.time.layer = 5;
  ui.page.main.style.display = 'inline';
  page = MAIN;
  draw();
});

tripleTap(ui.weather.time, () => {
  getWeather(true);
});

document.getElementById('time-sw1-start').addEventListener('click', () => {
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

document.getElementById('time-sw2-start').addEventListener('click', () => {
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

document.getElementById('time-sw1-reset').addEventListener('click', () => {
  if (sw1Pause) {
    sw1 = 0;
    sw1Pause = 0;
    drawSW();
  }
});

document.getElementById('time-sw2-reset').addEventListener('click', () => {
  if (sw2Pause) {
    sw2 = 0;
    sw2Pause = 0;
    drawSW();
  }
});

ui.main.city.text = 'City'

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
    ekg.longs = json.longs;
    ekg.mids = json.mids;
    ekg.shorts = json.shorts;
  }
  
  // test data
  //ekg.longs = [97, 99, 88, 86, 71, 71, 72, 68, 69, 69, 65, 50, 56, 57, 56, 59, 63, 75, 80, 85];
  //ekg.mids = [90, 88, 87, 88, 87, 87, 90, 96, 100, 110, 111, 110, 105, 109, 114, 120, 132, 120, 122, 110];
  //ekg.shorts = [110, 115, 112, 111, 110, 109, 110, 99, 98, 95, 93, 92, 93, 90, 85, 80, 82, 80, 79, 75];
  
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
  }
} catch (e) { console.error(e); }

function updateHeart() {
  if (page === MAIN) {
    ui.main.minRate.text = `${minRate}/${resting}`;
    ui.main.maxRate.text = `${currentRate}/${maxRate}`;
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
    bump = true;
    ekg.long = now + ekg.longt;
  }
  if (now > ekg.mid) {
    ekg.mids.push(avg(ekg.shorts) || resting || 60);
    if (ekg.mids.length > 20) ekg.mids.shift();
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

setInterval(() => {
  resting = user.restingHeartRate;
}, 7200000);

function drawEKG() {
  let lines, points, ekgHeight, offset, texts, ming, start;
  if (page === MAIN) {
    lines = ui.main.heart.lines;
    points = [].concat(ekg.longs.slice(3), ekg.mids.slice(3), ekg.shorts.slice(4));
    ekgHeight = screenHeight / 2;
    offset = 20;
    texts = [];
    ming = 10;
    start = resting;
  } else if (page === HEARTL) {
    lines = ui.heart.long.lines;
    points = ekg.longs.slice();
    ekgHeight = Math.round(screenHeight * 0.8);
    offset = 40;
    texts = ui.heart.long.texts;
    ming = 5;
    start = resting;
  } else if (page === HEARTM) {
    lines = ui.heart.long.lines;
    points = ekg.mids.slice();
    ekgHeight = Math.round(screenHeight * 0.8);
    offset = 40;
    texts = ui.heart.long.texts;
    ming = 5;
    start = ekg.longs[ekg.longs.length - 1];
  } else if (page === HEARTS) {
    lines = ui.heart.long.lines;
    points = ekg.shorts.slice();
    ekgHeight = Math.round(screenHeight * 0.8);
    offset = 40;
    texts = ui.heart.long.texts;
    ming = 5;
    start = ekg.mids[ekg.mids.length - 1];
  }
  
  if (lines && points) {
    const min = minRate = Math.min.apply(Math, points.concat(start));
    let max = maxRate = Math.max.apply(Math, points.concat(start));
    if (max - min < ming) max = min + ming;
    const unit = (ekgHeight - (2 * offset)) / (max - min);
    const ps = [];

    points.reduce((a, c, i) => {
      lines[i].y1 = ekgHeight - (offset + ((a - min) * unit));
      ps.push(lines[i].y1);
      lines[i].y2 = ekgHeight - (offset + ((c - min) * unit));
      if (texts[i]) {
        texts[i].text = c;
        texts[i].y = lines[i].y2 + (i % 2 === 0 ? 25 : -10);
      }
      return c;
    }, start);
    
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
  const hours = (settings.time ? today.getHours() % 12 || 12 : zeroPad(today.getHours())) + ':';
  const minutes = zeroPad(today.getMinutes());
  const date = `${today.getFullYear()}-${zeroPad(today.getMonth() + 1)}-${zeroPad(today.getDate())}`;
  
  if (page === MAIN) {
    ui.main.hours.text = hours;
    ui.main.minutes.text = minutes;
    ui.main.hoursShadow.text = hours;
    ui.main.minutesShadow.text = minutes;
    ui.main.date.text = date;
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
  }
}
clock.ontick = updateTimeCb;
function updateTime() { updateTimeCb({ date: new Date() }); }

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
  console.log('app peer error', e);
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
  } else if (page === WEATHER) {
    const dt = new Date(weather.when || 0);
    ui.weather.when.text = `${dt.getFullYear()}-${zeroPad(dt.getMonth() + 1)}-${zeroPad(dt.getDate())} ${settings.time ? dt.getHours() % 12 || 12 : zeroPad(dt.getHours())}:${zeroPad(dt.getMinutes())}`;
    ui.weather.where.text = weather.city;
    weather.list.forEach((w, i) => {
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
      ui.weather.winds[i].text = `${windDir(w.wind.deg)}${settings.temp ? mToMi(w.wind.speed * 3600).toFixed(1) : w.wind.speed.toFixed(1)}`;
    })
  }
}

// Stats
function updateStats() {
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
    w.steps.text = `${a.steps}`;
    w.stepsBar.width = Math.floor(stepPct * barWidth); w.stepsBar.x = barWidth - w.stepsBar.width;
    w.distance.text = `${settings.temp ? mToMi(a.distance) : a.distance}`;
    w.distanceBar.width = Math.floor(distPct * barWidth); w.distanceBar.x = barWidth - w.distanceBar.width;
    w.calories.text = `${a.calories}`;
    w.caloriesBar.width = Math.floor(calPct * barWidth); w.caloriesBar.x = barWidth - w.caloriesBar.width;
    w.floors.text = `${a.elevationGain}`;
    w.floorsBar.width = Math.floor(floorPct * barWidth); w.floorsBar.x = barWidth - w.floorsBar.width;
    w.activeMinutes.text = `${m.total || 0}`;
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
    
    w.amt.step.text = `${a.steps}`;
    w.amt.dist.text = `${settings.temp ? mToMi(a.distance) : a.distance}`;
    w.amt.active.text = `${m.total || 0}`;
    w.amt.cal.text = `${a.calories}`;
    w.amt.floor.text = `${a.elevationGain}`;
    
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
    
    w.amt.fatburn.text = `${m.fatBurn || 0}`;
    w.amt.cardio.text = `${m.cardio || 0}`;
    w.amt.peak.text = `${m.peak || 0}`;
  }
}
setInterval(updateStats, 5000);

// Battery
function updateBattery() {
  const level = `${zeroPad(battery.chargeLevel)}%`;
  if (page === MAIN) ui.main.battery.text = level;
  else if (page === HEARTL || page === HEARTM || page === HEARTS) ui.heart.long.battery.text = level;
  else if (page === WEATHER) ui.weather.battery.text = level;
  else if (page === STATS) ui.stats.battery.text = level;
  else if (page === TIME) ui.time.battery.text = level;
}
battery.onchange = updateBattery;

// Pages
function draw() {
  if (page === MAIN) drawMain();
  else if (page === HEARTL) drawHeart(0);
  else if (page === HEARTM) drawHeart(1);
  else if (page === HEARTS) drawHeart(2);
  else if (page === WEATHER) drawWeather();
  else if (page === STATS) drawStats();
  else if (page === TIME) drawTime();
  
  updateTime();
  updateBattery();
}

function drawMain() {
  updateStats();
  updateWeather();
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
}

function drawTime() {
  drawSW(true);
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
  const now = Date.now();
  
  if (sw1 && !sw1Pause) ui.time.sw1.text = timeStr(now - sw1);
  else if (!sw1) ui.time.sw1.text = timeStr(0);
  else if (init && sw1Pause) ui.time.sw1.text = timeStr(sw1Pause - sw1);
  
  if (sw2 && !sw2Pause) ui.time.sw2.text = timeStr(now - sw2);
  else if (!sw2) ui.time.sw2.text = timeStr(0);
  else if (init && sw2Pause) ui.time.sw2.text = timeStr(sw2Pause - sw2);
  
  if (page === TIME && (sw1 && !sw1Pause) || (sw2 && !sw2Pause)) requestAnimationFrame(drawSW);
}

function updateColors() {
  ui.main.hours.style.fill = settings.hourColor || 'white';
  ui.main.minutes.style.fill = settings.minuteColor || 'blue';
  ui.main.maxRate.style.fill = settings.heartrateColor || 'red';
  ui.main.minRate.style.fill = settings.heartrateColor || 'red';
  eclass('ekg-line').forEach(l => l.style.fill = settings.graphColor || 'lightgreen');
}

// Init view
updateColors();
draw();
getWeather();