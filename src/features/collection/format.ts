export const clampProgress = (value: number) => {
  return Math.min(1, Math.max(0, value));
};

export const toProgress = (current: number, total: number) => {
  if (total <= 0) {
    return 0;
  }

  return clampProgress(current / total);
};

const pad = (value: number) => {
  return value.toString().padStart(2, "0");
};

export const formatCollectedDate = (isoDate: string) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}.${pad(date.getMonth() + 1)}.${pad(date.getDate())}`;
};

const startOfDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

/** 일주일이 지난 날짜는 상대 표기가 의미 없어서 null을 준다 (절대 날짜만 보여준다). */
export const formatCollectedRelative = (isoDate: string, now = new Date()) => {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const dayDiff = Math.round(
    (startOfDay(now) - startOfDay(date)) / (1000 * 60 * 60 * 24),
  );

  if (dayDiff <= 0) {
    return "오늘";
  }

  if (dayDiff === 1) {
    return "어제";
  }

  if (dayDiff < 7) {
    return `${dayDiff}일 전`;
  }

  return null;
};
