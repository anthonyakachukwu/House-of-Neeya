import { supabase } from "@/utils/supabase/client";

/**
 * `.in()` puts every id in the request URL, which breaks past ~200 uuids.
 * This splits the ids into chunks and joins the results.
 */
export async function selectIn<T>(
  table: string,
  column: string,
  ids: string[],
  columns = "*",
  size = 100,
): Promise<T[]> {
  const unique = [...new Set(ids.filter(Boolean))];
  if (unique.length === 0) return [];

  const db = supabase();
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += size) chunks.push(unique.slice(i, i + size));

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const { data, error } = await db.from(table).select(columns).in(column, chunk);
      if (error) throw new Error(error.message);
      return (data ?? []) as unknown as T[];
    }),
  );
  return results.flat();
}
