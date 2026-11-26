// Supabase "timestamp" columns come back without a timezone, so treat them as UTC.
export function parseDbDate(value: string): Date {
  const text = value.replace(" ", "T");
  const hasZone = /(Z|[+-]\d{2}(:?\d{2})?)$/i.test(text);
  return new Date(hasZone ? text : `${text}Z`);
}

export function formatDate(value: string) {
  return parseDbDate(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}
