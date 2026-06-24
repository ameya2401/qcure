export function formatMinutes(value: number) {
  if (value === 0) {
    return "0 min";
  }

  if (value < 60) {
    return `${value} min`;
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;

  return minutes === 0 ? `${hours} hr` : `${hours} hr ${minutes} min`;
}

export function formatQueueHealth(value: "GREEN" | "YELLOW" | "RED") {
  return {
    GREEN: "Stable",
    YELLOW: "Watch closely",
    RED: "Needs intervention",
  }[value];
}
