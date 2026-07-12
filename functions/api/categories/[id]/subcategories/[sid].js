export async function onRequestPut(context) {
  const { receipts_db: DB } = context.env;
  const categoryId = context.params.id;
  const subId = context.params.sid;
  const body = await context.request.json();
  const name = (body.name || "").trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "ต้องใส่ชื่อหมวดหมู่ย่อย" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const exists = await DB.prepare(
    "SELECT id FROM subcategories WHERE category_id = ? AND name = ? AND id != ?"
  )
    .bind(categoryId, name, subId)
    .first();
  if (exists) {
    return new Response(
      JSON.stringify({ error: "มีหมวดหมู่ย่อยนี้อยู่แล้ว" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const res = await DB.prepare(
    "UPDATE subcategories SET name = ? WHERE id = ? AND category_id = ?"
  )
    .bind(name, subId, categoryId)
    .run();

  if (!res.meta || res.meta.changes === 0) {
    return new Response(JSON.stringify({ error: "ไม่พบหมวดหมู่ย่อย" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ id: subId, category_id: categoryId, name }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestDelete(context) {
  const { receipts_db: DB } = context.env;
  const categoryId = context.params.id;
  const subId = context.params.sid;

  await DB.prepare(
    "DELETE FROM subcategories WHERE id = ? AND category_id = ?"
  )
    .bind(subId, categoryId)
    .run();

  return new Response(null, { status: 204 });
}
