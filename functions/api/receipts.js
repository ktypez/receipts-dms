export async function onRequestGet(context) {
  const { DB } = context.env;
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
    where.push("filename LIKE ?");
    params.push(`%${q}%`);
  }
  if (where.length) sql += " WHERE " + where.join(" AND ");
  sql += " ORDER BY uploaded_at DESC";

  const { results } = await DB.prepare(sql).bind(...params).all();
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestDelete(context) {
  const { receipts_db: DB, BUCKET } = context.env;
  const url = new URL(context.request.url);
  const id = url.pathname.split("/").pop();

  if (!id) return new Response("ไม่พบไอดี", { status: 400 });

  await BUCKET.delete(id);

  await DB.prepare("DELETE FROM receipts WHERE id = ?").bind(id).run();

  return new Response(null, { status: 204 });
}
