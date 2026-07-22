export const formatNumber = (value: number) => {
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

export const clampProgress = (value: number) => {
  return Math.min(1, Math.max(0, value));
};

export const toProgress = (current: number, total: number) => {
  if (total <= 0) {
    return 0;
  }

  return clampProgress(current / total);
};
