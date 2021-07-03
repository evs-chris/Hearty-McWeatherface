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

export function mToMi(m) {
  return Math.round((m / 1609.344) * 100) / 100;
}

export function multiTap(count) {
  return function(el, fn) {
    let clicks = 0;
    let pos;
    let timeout;
    el.addEventListener('mouseup', ev => {
      if (clicks) {
        clicks++;
        if (timeout) clearTimeout(timeout);
        timeout = 0;
        if (Math.abs(Math.abs(pos.x - ev.screenX) - Math.abs(pos.y - ev.screenY)) < 40) {
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

export const doubleTap = multiTap(2);
export const tripleTap = multiTap(3);