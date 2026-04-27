const PERIOD_ORDER = ["4th", "5th", "6th"];

const LUNCH_SCHEDULES = {
  MON_FRI: {
    "4th": { start: 636, end: 686 }, // 10:36-11:26
    "5th": { start: 692, end: 742 }, // 11:32-12:22
    "6th": { start: 748, end: 798 }, // 12:28-1:18
  },
  TUE_THU: {
    "4th": { start: 665, end: 710 }, // 11:05-11:50
    "5th": { start: 715, end: 760 }, // 11:55-12:40
    "6th": { start: 765, end: 810 }, // 12:45-1:30
  },
  WED: {
    "4th": { start: 681, end: 723 }, // 11:21-12:03
    "5th": { start: 728, end: 769 }, // 12:08-12:49
    "6th": { start: 774, end: 816 }, // 12:54-1:36
  },
};

function timeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") {
    return NaN;
  }

  const [time, period] = timeStr.trim().split(/\s+/);
  let [hours, minutes] = time.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return NaN;
  }

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }
  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return hours * 60 + minutes;
}

function getScheduleKeyFromDate(dateStr) {
  if (!dateStr || typeof dateStr !== "string") {
    return null;
  }

  const [year, month, day] = dateStr.split("-").map(Number);
  if (Number.isNaN(year) || Number.isNaN(month) || Number.isNaN(day)) {
    return null;
  }

  // Build a local date to avoid UTC day-shift edge cases.
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  const weekday = date.getDay();

  if (weekday === 1 || weekday === 5) {
    return "MON_FRI";
  }
  if (weekday === 2 || weekday === 4) {
    return "TUE_THU";
  }
  if (weekday === 3) {
    return "WED";
  }

  return null;
}

function parseTimeRangeToMinutes(slotRangeStr) {
  if (!slotRangeStr || typeof slotRangeStr !== "string") {
    return null;
  }

  const [slotStartRaw, slotEndRaw] = slotRangeStr
    .split("-")
    .map((part) => part.trim());

  if (!slotStartRaw || !slotEndRaw) {
    return null;
  }

  const slotStart = timeToMinutes(slotStartRaw);
  const slotEnd = timeToMinutes(slotEndRaw);

  if (Number.isNaN(slotStart) || Number.isNaN(slotEnd)) {
    return null;
  }

  return { slotStart, slotEnd };
}

function getLunchPeriodsForSlot(dateStr, slotRangeStr) {
  const scheduleKey = getScheduleKeyFromDate(dateStr);
  if (!scheduleKey) {
    return null;
  }

  const slot = parseTimeRangeToMinutes(slotRangeStr);
  if (!slot) {
    return null;
  }

  const schedule = LUNCH_SCHEDULES[scheduleKey];
  const matches = PERIOD_ORDER.filter((period) => {
    const periodWindow = schedule[period];

    // Inclusive-inclusive overlap: [slotStart, slotEnd] with [start, end]
    return (
      slot.slotStart <= periodWindow.end && slot.slotEnd >= periodWindow.start
    );
  });

  if (matches.length === 0) {
    return null;
  }

  return matches.join("/");
}

module.exports = {
  LUNCH_SCHEDULES,
  getScheduleKeyFromDate,
  parseTimeRangeToMinutes,
  getLunchPeriodsForSlot,
};