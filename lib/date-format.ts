export const formatDateTime = (value?: string | null): string | null => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleString();
};

export const formatDisplayDate = (value: string): string => {
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("mn-MN", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
};

export const formatTimeLabel = (value: string): string => value.replace(/:00$/, ":00 цаг");
