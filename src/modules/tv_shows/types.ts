export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Other"] as const;
export type Day = typeof DAYS[number];

export const STATUSES = ["Watching", "Carryover", "Unstarted"] as const;
export type Status = typeof STATUSES[number];

export const MEDIA_TYPES = ["Series", "Movie", "OVA"] as const;
export type MediaType = typeof MEDIA_TYPES[number];

export interface TvShow {
  id: number;
  name: string;
  air_day: Day;
  episode: number;
  caught_up: boolean;
  status: Status;
  type: MediaType;
  url: string | null;
}

export const DAY_MAP: Record<string, Day> = {
  "Monday": "Mon", "Tuesday": "Tue", "Wednesday": "Wed",
  "Thursday": "Thu", "Friday": "Fri", "Saturday": "Sat", "Sunday": "Sun",
};

export const TODAY_DAY = (["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const)[new Date().getDay()];

export const defaultShowForm = (day: Day): Omit<TvShow, "id"> => ({
  name: "", air_day: day, episode: 0, caught_up: false, status: "Watching", type: "Series", url: null,
});
