const { parseWhen } = require('../utils/dateParse');

const monday = new Date('2026-03-02T10:00:00');

test('"tomorrow evening" resolves to the next day, 17:00-21:00', () => {
  const w = parseWhen('Will it rain tomorrow evening in Bellary?', monday);
  expect(w.dayOffset).toBe(1);
  expect(w.partOfDay).toBe('evening');
  expect(w.startHour).toBe(17);
  expect(w.endHour).toBe(21);
  expect(w.date).toBe('2026-03-03');
});

test('"this afternoon" stays on today', () => {
  const w = parseWhen('How hot will it be this afternoon?', monday);
  expect(w.dayOffset).toBe(0);
  expect(w.partOfDay).toBe('afternoon');
});

test('"this weekend" moves to Saturday', () => {
  const w = parseWhen('What will the weather be like this weekend?', monday);
  expect(w.date).toBe('2026-03-07');
});

test('a plain question defaults to today, whole day', () => {
  const w = parseWhen('Should I carry an umbrella?', monday);
  expect(w.dayOffset).toBe(0);
  expect(w.partOfDay).toBeNull();
  expect(w.startHour).toBe(0);
  expect(w.endHour).toBe(23);
});
