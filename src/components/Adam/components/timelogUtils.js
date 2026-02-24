

/**

* @returns {string}
*/
export function getMachineTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/**
 * Get a human-readable location/city name from a timezone ID
 * e.g. "America/New_York" → "New York"
 * @param {string} timezoneId - IANA timezone
 * @returns {string}
 */
export function getLocationFromTimezone(timezoneId) {
  if (!timezoneId) return "Unknown";
  try {
    const parts = timezoneId.split("/");
    const loc = parts[parts.length - 1].replace(/_/g, " ");
    return loc || timezoneId;
  } catch {
    return timezoneId;
  }
}

/**
 * Format a date in a specific timezone
 * @param {Date|string|number} date
 * @param {string} timezoneId
 * @param {Intl.DateTimeFormatOptions} [options]
 * @returns {string}
 */
export function formatInTimezone(date, timezoneId, options = {}) {
  const d = date instanceof Date ? date : new Date(date);
  const defaults = {
    timeZone: timezoneId || getMachineTimezone(),
    dateStyle: "medium",
    timeStyle: "short",
    hour12: true,
    ...options,
  };
  try {
    return new Intl.DateTimeFormat(undefined, defaults).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/**
 * Get current time formatted for a timezone
 * @param {string} [timezoneId]
 * @returns {{ date: string, time: string, full: string }}
 */
export function getCurrentTimeForTimezone(timezoneId) {
  const tz = timezoneId || getMachineTimezone();
  const now = new Date();
  return {
    date: formatInTimezone(now, tz, { dateStyle: "long", timeStyle: undefined }),
    time: formatInTimezone(now, tz, { dateStyle: undefined, timeStyle: "medium" }),
    full: formatInTimezone(now, tz),
  };
}

/**
 * Get offset string for a timezone (e.g., "UTC-5")
 * @param {string} timezoneId
 * @returns {string}
 */
export function getTimezoneOffset(timezoneId) {
  try {
    const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: timezoneId,
      timeZoneName: "shortOffset",
    });
    const parts = formatter.formatToParts(new Date());
    const offset = parts.find((p) => p.type === "timeZoneName");
    return offset ? offset.value : "";
  } catch {
    return "";
  }
}

/**
 
* @param {string} [timezoneId]
* @param {number} [count=5]
* @returns {Array<{ id: string, task: string, start: Date, end: Date, duration: number }>}
*/
export function generateDemoTimelogs(timezoneId, count = 5) {
  const tz = timezoneId || getMachineTimezone();
  const now = new Date();
  const tasks = [
    "Code review: Auth module",
    "Sprint planning meeting",
    "Bug fix: Dashboard loading",
    "API documentation",
    "Unit tests: Payment service",
  ];

  const entries = [];
  for (let i = 0; i < Math.min(count, tasks.length); i++) {
    const start = new Date(now);
    start.setDate(start.getDate() - i);
    start.setHours(9 + (i % 3), 30, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1 + (i % 2), 15 + i * 5, 0, 0);
    const durationMs = end - start;
    const duration = Math.round(durationMs / 60000);

    entries.push({
      id: `tl-${i}-${Date.now()}`,
      task: tasks[i],
      start,
      end,
      duration,
    });
  }
  return entries;
}

/**

* @param {number} minutes
* @returns {string}
*/
export function formatDuration(minutes) {
  if (!minutes || minutes < 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/**

* @returns {Promise<{ lat: number, lng: number }|null>}
*/
export function getGeolocationCoords() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 60000 }
    );
  });
}

/**

* @param {number} lat
* @param {number} lng
* @returns {Promise<string|null>} e.g. "Manila, Philippines" or null
*/
export function reverseGeocode(lat, lng) {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
    {
      headers: { "Accept-Language": "en", "User-Agent": "TimelogsDemo/1.0" },
    }
  )
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      if (!data?.address) return null;
      const a = data.address;
      const city = a.city || a.town || a.municipality || a.village || a.county || "";
      const country = a.country || "";
      if (city && country) return `${city}, ${country}`;
      if (country) return country;
      if (city) return city;
      return data.display_name?.split(",").slice(0, 2).join(",") || null;
    })
    .catch(() => null);
}
