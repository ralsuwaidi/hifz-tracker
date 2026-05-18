export const PAGE_SECS = 80;
export const TOTAL_PAGES = 48;

export type Status = "red" | "ram" | "trigger" | "cold" | "new";

export const STATUSES: Record<Status, { label: string; color: string; reps: number }> = {
  red:     { label: "Forgotten",    color: "#E5484D", reps: 10 },
  ram:     { label: "RAM",          color: "#E07B39", reps: 4  },
  trigger: { label: "Trigger",      color: "#52A8FF", reps: 1  },
  cold:    { label: "Cold Storage", color: "#46A758", reps: 1  },
  new:     { label: "Not Started",  color: "#AAAAAA", reps: 0  },
};

export const STATUS_ORDER: Status[] = ["red", "ram", "trigger", "cold", "new"];
