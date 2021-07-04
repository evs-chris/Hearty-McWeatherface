import { me } from "companion";
import * as messaging from "messaging";
import { settingsStorage } from "settings";
import { geolocation } from "geolocation";
import { localStorage } from "local-storage";

const settings = ['time', 'temp', 'hourColor', 'minuteColor', 'heartrateColor', 'graphColor'];
const queue = [];

console.log('starting companion');

function flushQueue() {
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    const msgs = queue.splice(0, queue.length);
    console.log('companion flushing queue');
    msgs.forEach(m => {
      console.log(`companion sending ${JSON.stringify(m)}`);
      messaging.peerSocket.send(m);
    });
  } else {
    console.log(`socket not ready for queue flush`);
  }
}

me.monitorSignificantLocationChanges = true;

me.onsignificantlocationchange = evt => {
  if (settingsStorage.getItem('forceZip') !== 'true') {
    const last = localStorage.getItem('lastWeather') || 0;
    // back up the last time 2.5 hours
    localStorage.setItem('lastWeather', last - 2700000);
    checkWeather();
  }
}

settingsStorage.onchange = evt => {
  console.log('settings changed');
  if (localStorage.getItem('forceZip') !== settingsStorage.getItem('forceZip') || localStorage.getItem('altZip') !== settingsStorage.getItem('altZip') || localStorage.getItem('weatherKey') !== settingsStorage.getItem('weatherKey')) {
    localStorage.setItem('lastWeather', 0);
  }
  localStorage.setItem('forceZip', settingsStorage.getItem('forceZip'));
  localStorage.setItem('altZip', settingsStorage.getItem('altZip'));
  localStorage.setItem('weatherKey', settingsStorage.getItem('weatherKey'));
  
  checkWeather();
  sendSettings();
}

messaging.peerSocket.onopen = () => {
  console.log('companion peer open');
  flushQueue();
}

messaging.peerSocket.onerror = err => {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

messaging.peerSocket.onclose = () => {
  console.log('companion peer closed');
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = evt => {
  if (!evt.data || !evt.data.type) return;
  if (evt.data.type === 'weather') {
    if (evt.data.force) localStorage.setItem('lastWeather', 0);
    checkWeather(evt.data.value);
  } else if (evt.data.type === 'waterlog') {
    console.log(`got a request to log ${ev.data.value} water`);
    // add water and return stats
  } else if (evt.data.type === 'water') {
    console.log(`got a request to fetch water stats`);
    // get water stats
  }
}

const privateSettings = ['fitbitAuth'];
function sendSettings() {
  const obj = {};
  settings.forEach(k => {
    if (~privateSettings.indexOf(k)) return;
    try {
      obj[k] = JSON.parse(settingsStorage.getItem(k));
    } catch (e) {
      obj[k] = settingsStorage.getItem(k);
    }
  });
  
  queue.push({ type: 'settings', value: obj });
  flushQueue();
}

var bits = ['6f7b', '03cd', 'd3f8', '1833', '239b', 'c948', '7fdd', '83f2' ];
// please don't be a dick
const nothingSpecial = [3, 2, 5, 7, 0, 6, 1, 4].map(v => bits[v]).join('');
var ENDPOINT = "https://api.openweathermap.org/data/2.5/forecast";

function zeroPad(n) {
  if (n < 10) return `0${n}`;
  else return `${n}`;
}

function processWeather(response) {
  if (response.status >= 200 && response.status <= 299) {
    response.json().then(function(data) {
      console.log(`got weather for ${JSON.stringify(data.city)}`);
      const weather = { info: {} };
      weather.info.city = data.city.name;
      weather.info.when = Date.now();
      weather.info.loc = data.coords;
      weather.list = data.list.map(w => ({
        temp: w.main.temp,
        feel: w.main.feels_like,
        precip: w.pop,
        desc: w.weather[0].main,
        id: w.weather[0].id,
        min: w.main.temp_min,
        max: w.main.temp_max,
        hum: w.main.humidity,
        when: w.dt,
        clouds: w.clouds.all,
        wind: w.wind
      }));
      const list = weather.list;
      console.log(JSON.stringify(list[0]))
      
      let morning = +(new Date(list[0].when * 1000)).toString().substr(16, 2);
      while (morning + 3 <= 12) morning += 3;
      while (morning > 12) morning -= 3;
      let evening = morning + 6;
      
      const tmp = [(new Date((list[0].when * 1000) + 86400000)).toString().substr(0, 16), (new Date((list[0].when * 1000) + 172800000)).toString().substr(0, 16), (new Date((list[0].when * 1000) + 259200000)).toString().substr(0, 16)];
      const dts = [];
      for (let i = 0; i < tmp.length; i++) dts.push(`${tmp[i]}${zeroPad(morning)}`, `${tmp[i]}${zeroPad(evening)}`);
      weather.list = list.reduce((a, c, i) => {
        if (i <= 2) a.push(c);
        else if (~dts.indexOf((new Date(c.when * 1000)).toString().substr(0, 18))) a.push(c);
        return a;
      }, []);
      
      localStorage.setItem('lastWeather', weather.info.when);
      localStorage.setItem('weather', JSON.stringify(weather));
      sendWeather();
    });
  }
}

function sendWeather() {
  const weather = JSON.parse(localStorage.getItem('weather'));
  queue.push({ type: 'weather', value: weather.info });
  weather.list.forEach((l, i) => queue.push({ type: 'weather', key: i, value: l }));
  flushQueue();
}

function json(str) {
  let res = {};
  try {
    res = JSON.parse(str);
  } catch (e) {}
  if (!res) res = {};
  return res;
}

// Fetch the weather from OpenWeather
function queryOpenWeather() {
  const key = json(settingsStorage.getItem('weatherKey')).name || nothingSpecial;
  console.log(`getting weather with key ${key}`)
  if (localStorage.getItem('forceZip') === 'true') {
    console.log(`fetching weather for zip ${settingsStorage.getItem('altZip')}`);
    fetch(ENDPOINT + `?zip=${json(settingsStorage.getItem('altZip')).name || '90210'}&appid=${key}`, { mode: 'cors' }).then(processWeather, err => {
      console.error("Error fetching weather: " + err);
    });
  } else {
    geolocation.getCurrentPosition(position => {
      fetch(ENDPOINT + `?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${key}`, { mode: 'cors' })
      .then(processWeather)
      .catch(function (err) {
        console.log("Error fetching weather: " + err);
      });
    }, err => {
      fetch(ENDPOINT + `?zip=${json(settingsStorage.getItem('altZip')).name || '90210'}&appid=${key}`, { mode: 'cors' }).then(processWeather, err => {
        console.error("Error fetching weather: " + err);
      });
    });
  }
}

function checkWeather(value) {
  const last = localStorage.getItem('lastWeather');
  if (!last || last < (Date.now() - 3600000)) {
    console.log(Date.now() - 3600000, last);
    queryOpenWeather();
  } else {
    if (!value || value != last) sendWeather();
  }
}

sendSettings();
