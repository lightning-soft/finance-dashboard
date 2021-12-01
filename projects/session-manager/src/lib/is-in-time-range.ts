
export function isInTimeRange(date, session) {
  if (!session?.workingTimes)
    return true;

  const _date = (moment as any).tz(date, session.timezoneId)._d;
  const currentDay = _date.getDay();
  const time = getTimeFromDate(_date);
  return session?.workingTimes.some(({ endDay, endTime, startDay, startTime }) =>
    (currentDay < endDay || (currentDay === endDay && time <= endTime)) &&
    (currentDay > startDay || (currentDay === startDay && time >= startTime)));
}

export function getTimeFromDate(date: Date) {
  return ((date.getHours() * 3600)
    + (date.getMinutes() * 60)) * 1000;
}
