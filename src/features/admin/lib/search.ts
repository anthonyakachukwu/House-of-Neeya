/** Every space-separated term must appear somewhere in the searchable text. */
export function matchesSearch(
  fields: (string | null | undefined)[],
  query: string,
) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const text = fields.filter(Boolean).join(" ").toLowerCase();
  return terms.every((term) => text.includes(term));
}