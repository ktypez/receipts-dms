export async function onRequestGet(context) {
  const { receipts_db: DB } = context.env;
  const categoryId = context.params.id;
  const { results } = await DB.prepare(
    "SELECT * FROM subcategories WHERE category_id = ? ORDER BY sort_order, created_at"
  )
    .bind(categoryId)
    .all();
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { receipts_db: DB } = context.env;
  const categoryId = context.params.id;
  const body = await context.request.json();
  const name = (body.name || "").trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "ต้องใส่ชื่อหมวดหมู่ย่อย" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cat = await DB.prepare("SELECT id FROM categories WHERE id = ?")
    .bind(categoryId)
    .first();
  if (!cat) {
    return new Response(JSON.stringify({ error: "ไม่พบหมวดหมู่หลัก" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const exists = await DB.prepare(
    "SELECT id FROM subcategories WHERE category_id = ? AND name = ?"
  )
    .bind(categoryId, name)
    .first();
  if (exists) {
    return new Response(
      JSON.stringify({ error: "มีหมวดหมู่ย่อยนี้อยู่แล้ว" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await DB.prepare(
    "INSERT INTO subcategories (id, category_id, name, created_at) VALUES (?, ?, ?, ?)"
  )
    .bind(id, categoryId, name, now)
    .run();

  return new Response(
    JSON.stringify({ id, category_id: categoryId, name, created_at: now }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}
