export async function onRequestPost(context) {
  const { receipts_db: DB } = context.env;
  const categoryId = context.params.id;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const orderedIds = body.ordered_ids;
  if (!Array.isArray(orderedIds)) {
    return new Response(JSON.stringify({ error: "ordered_ids must be an array" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const ids = orderedIds.map((id) => String(id));
  const placeholders = ids.map(() => "?").join(",");
  const existing = await DB.prepare(
    `SELECT id FROM subcategories WHERE category_id = ? AND id IN (${placeholders})`
  ).bind(categoryId, ...ids).all();
  const valid = new Set(existing.results.map((r) => r.id));
  const finalIds = ids.filter((id) => valid.has(id));

  const tx = await DB.batch(
    finalIds.map((id, index) =>
      DB.prepare(
        "UPDATE subcategories SET sort_order = ? WHERE id = ? AND category_id = ?"
      ).bind(index, id, categoryId)
    )
  );
  if (!tx) {
    return new Response(JSON.stringify({ error: "Transaction failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
