export async function onRequestPost(context) {
  const { receipts_db: DB } = context.env;
  const fromCategoryId = context.params.id;
  const subId = context.params.sid;
  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const toCategoryId = (body.category_id || "").trim();
  const orderedIds = Array.isArray(body.ordered_ids)
    ? body.ordered_ids.map(String)
    : [];

  if (!toCategoryId || toCategoryId === fromCategoryId) {
    return new Response(
      JSON.stringify({ error: "Invalid target category" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const sub = await DB.prepare(
    "SELECT id, name FROM subcategories WHERE id = ? AND category_id = ?"
  )
    .bind(subId, fromCategoryId)
    .first();
  if (!sub) {
    return new Response(JSON.stringify({ error: "ไม่พบหมวดหมู่ย่อย" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const targetCat = await DB.prepare("SELECT id FROM categories WHERE id = ?")
    .bind(toCategoryId)
    .first();
  if (!targetCat) {
    return new Response(JSON.stringify({ error: "ไม่พบหมวดหมู่หลัก" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const conflict = await DB.prepare(
    "SELECT id FROM subcategories WHERE category_id = ? AND name = ? AND id != ?"
  )
    .bind(toCategoryId, sub.name, subId)
    .first();
  if (conflict) {
    return new Response(
      JSON.stringify({ error: "มีหมวดหมู่ย่อยนี้อยู่แล้วในหมวดหมู่ปลายทาง" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const tx = await DB.batch([
    DB.prepare(
      "UPDATE subcategories SET category_id = ? WHERE id = ?"
    ).bind(toCategoryId, subId),
    ...orderedIds
      .filter((id) => id !== subId)
      .map((id, index) =>
        DB.prepare(
          "UPDATE subcategories SET sort_order = ? WHERE id = ? AND category_id = ?"
        ).bind(index, id, toCategoryId)
      ),
    DB.prepare(
      "UPDATE subcategories SET sort_order = ? WHERE id = ?"
    ).bind(orderedIds.length, subId),
  ]);
  if (!tx) {
    return new Response(JSON.stringify({ error: "Transaction failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ id: subId, category_id: toCategoryId, name: sub.name }),
    { headers: { "Content-Type": "application/json" } }
  );
}
