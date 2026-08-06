type EventStatInput = { status: string; registration_count?: number };

export function summarizeEvents(items: EventStatInput[], total = items.length) {
  return { total, open: items.filter((item) => item.status === "open").length, closed: items.filter((item) => item.status !== "open").length, registrations: items.reduce((sum, item) => sum + (item.registration_count ?? 0), 0) };
}
