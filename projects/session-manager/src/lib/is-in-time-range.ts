
export function isInTimeRange(date, workingTimes) {
  if (!workingTimes)
    return true;

  const currentDay = date.getDay();
  const time = getTimeFromDate(date);
  return workingTimes.some(({ endDay, endTime, startDay, startTime }) =>
    (currentDay < endDay || (currentDay === endDay && time <= endTime)) &&
    (currentDay > startDay || (currentDay === startDay && time >= startTime)));
}

export function getTimeFromDate(date: Date) {
  return ((date.getHours() * 3600)
    + (date.getMinutes() * 60)) * 1000;
}
