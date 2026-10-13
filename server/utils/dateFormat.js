export const parseDdMmYyyy = (value) => {
  if (typeof value !== 'string') {
    return null;
  }

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  const date = new Date(Date.UTC(year, month - 1, day));

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return date;
};
