export async function onRequestGet(context) {
  const { receipts_db: DB } = context.env;
  const url = new URL(context.request.url);
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q");

  let sql = "SELECT * FROM receipts";
  const params = [];
  const where = [];
  if (category) {
    where.push("category = ?");
    params.push(category);
  }
  if (q) {
    where.push("(filename LIKE ? OR notes LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY uploaded_at DESC";

  const { results } = await DB.prepare(sql).bind(...params).all();

  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}
