// Small deterministic helper that turns everyday phrases ("tomorrow evening")
// into a concrete date + hour window. Gemini can also pass these values
// explicitly; this is the fallback and the validator.

const PART_OF_DAY = {
  morning: { startHour: 6, endHour: 11, label: 'morning' },
  afternoon: { startHour: 12, endHour: 16, label: 'afternoon' },
  evening: { startHour: 17, endHour: 21, label: 'evening' },
  night: { startHour: 22, endHour: 5, label: 'night' },
};

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseWhen(text = '', now = new Date()) {
  const q = String(text).toLowerCase();
  let dayOffset = 0;
  let dayLabel = 'today';

  if (/day after tomorrow|parson|\bin two days\b/.test(q)) {
    dayOffset = 2;
    dayLabel = 'day after tomorrow';
  } else if (/tomorrow|kal\b/.test(q)) {
    dayOffset = 1;
    dayLabel = 'tomorrow';
  } else if (/weekend/.test(q)) {
    const dow = now.getDay(); // 0 Sun .. 6 Sat
    dayOffset = dow === 6 ? 0 : (6 - dow + 7) % 7;
    dayLabel = 'this weekend';
  } else if (/tonight/.test(q)) {
    dayOffset = 0;
    dayLabel = 'tonight';
  } else if (/next week/.test(q)) {
    dayOffset = 7;
    dayLabel = 'next week';
  }

  let partOfDay = null;
  if (/morning/.test(q)) partOfDay = 'morning';
  else if (/afternoon/.test(q)) partOfDay = 'afternoon';
  else if (/evening/.test(q)) partOfDay = 'evening';
  else if (/night|tonight/.test(q)) partOfDay = 'night';

  const target = addDays(now, dayOffset);
  const window = partOfDay ? PART_OF_DAY[partOfDay] : null;

  return {
    date: toISODate(target),
    dayOffset,
    dayLabel,
    partOfDay,
    startHour: window ? window.startHour : 0,
    endHour: window ? window.endHour : 23,
  };
}

module.exports = { parseWhen, toISODate, addDays, PART_OF_DAY };
