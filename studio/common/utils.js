export function zeroPad(i) {
  if (i < 10) {
    i = "0" + i;
  }
  return i;
}

export function avg(arr) {
  return Math.round(arr.reduce((a, c) => a + c, 0) / arr.length);
}

export function keys(obj) {
  if (!obj) return [];
  const keys = [];
  for (const k in obj) keys.push(k);
  return keys;
}

export function fill(arr, el, from, to) {
  for (let i = from; i < to; i++) arr[i] = el;
  return arr;
}

export function find(arr, fn) {
  for (let i = 0; i < arr.length; i++) {
    if (fn(arr[i])) return arr[i];
  }
}

export function kelvinToC(temp) {
  return Math.round((+temp * 10) - 2731.5) / 10;
}

export function kelvinToF(temp) {
  return (Math.round(1.8 * ((+temp * 10) - 2731.5)) / 10) + 32
}

export function mToF(m) {
  if (!m) return 0;
  return m * 3.28084;
}

export function mToMi(m) {
  if (!m) return 0;
  return Math.round((m / 1609.344) * 100) / 100;
}

export function mToKm(m) {
  if (!m) return 0;
  return Math.floor(m / 1000);
}

export function mToMiLong(m) {
  return m / 1609.344;
}

export function msToKph(ms) {
  if (!ms) return 0;
  return ms * 3.6;
}

export function msToMph(ms) {
  if (!ms) return 0;
  return mToMiLong(ms * 3600);
}

export function skmToMs(skm) {
  if (!skm) return 0;
  return 1 / (skm / 1000);
}

export function skmToSmi(skm) {
  if (!skm) return 0;
  return 1 / mToMiLong(skmToMs(skm));
}

export function mlToOz(ml) {
  return Math.round(ml / 29.57);
}

export function ozToMl(oz) {
  return Math.round(oz * 29.57);
}

export function formatMilliseconds(ms, padh) {
  if (!ms) return padh ? '0:00:00' : '0:00';
  
  ms = Math.round(ms);
  
  const h = Math.floor(ms / 3600000);
  ms -= h * 3600000;
  const m = Math.floor(ms / 60000);
  ms -= m * 60000;
  const s = Math.floor(ms / 1000);
  
  return `${h ? `${h}:` : (padh ? '0:' : '')}${m ? (h || padh ? zeroPad(m) : m) : (padh ? '00' : '0')}:${zeroPad(s)}`;
}

export function formatSeconds(s, padh) {
  if (!s) return padh ? '0:00:00' : '0:00';
  return formatMilliseconds(s * 1000, padh);
}

const monodigits = [0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19].map(c => String.fromCharCode(c));
const digits = /[0-9]/g;
export function monoDigits(str) {
  return `${str}`.replace(digits, d => monodigits[+d]);
}

export function multiTap(count) {
  return function(el, fn) {
    let clicks = 0;
    let pos;
    let timeout;
    el.addEventListener('mouseup', ev => {
      if (clicks || count === 1) {
        clicks++;
        if (timeout) clearTimeout(timeout);
        timeout = 0;
        if (count === 1 || Math.abs(Math.abs(pos.x - ev.screenX) - Math.abs(pos.y - ev.screenY)) < 40) {
          if (clicks === count) {
            fn();
            clicks = 0;
          } else {
            timeout = setTimeout(() => {
              clicks = 0;
            }, 750);
          }
        }
      } else {
        pos = { x: ev.screenX, y: ev.screenY };
        clicks++;
        timeout = setTimeout(() => {
          clicks = 0
        }, 750);
      }
    });
  };
}

export const singleTap = multiTap(1);
export const doubleTap = multiTap(2);
export const tripleTap = multiTap(3);
