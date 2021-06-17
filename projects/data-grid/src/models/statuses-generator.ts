export function generateNewStatusesByPrefix(statuses: object, prefix: string, replaceValue?: string): object {
  let extendedStatuses = {...statuses};

  Object.keys(statuses).forEach(key => {
    key = ['color', 'backgroundColor'].includes(key) ? capitalizeFirstLetter(key) : key;
    extendedStatuses[`${prefix}${key}`] = replaceValue ?? statuses[key];
  });

  return extendedStatuses;
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
