export async function onRequestGet(context) {
  const { receipts_db: DB } = context.env;
  const { results } = await DB.prepare("SELECT * FROM categories ORDER BY created_at").all();
  return new Response(JSON.stringify(results), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { receipts_db: DB } = context.env;
  const body = await context.request.json();
  const name = (body.name || "").trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "ต้องใส่ชื่อหมวดหมู่" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const exists = await DB.prepare("SELECT id FROM categories WHERE name = ?")
    .bind(name)
    .first();
  if (exists) {
    return new Response(
      JSON.stringify({ error: "มีหมวดหมู่นี้อยู่แล้ว" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  await DB.prepare(
    "INSERT INTO categories (id, name, created_at) VALUES (?, ?, ?)"
  ).bind(id, name, now).run();

  return new Response(
    JSON.stringify({ id, name, created_at: now }),
    { status: 201, headers: { "Content-Type": "application/json" } }
  );
}

export async function onRequestPut(context) {
  const { receipts_db: DB } = context.env;
  const id = context.params.id;
  const body = await context.request.json();
  const name = (body.name || "").trim();
  if (!name) {
    return new Response(JSON.stringify({ error: "ต้องใส่ชื่อหมวดหมู่" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const conflict = await DB.prepare("SELECT id FROM categories WHERE name = ? AND id != ?")
    .bind(name, id)
    .first();
  if (conflict) {
    return new Response(
      JSON.stringify({ error: "มีหมวดหมู่นี้อยู่แล้ว" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  await DB.prepare("UPDATE categories SET name = ? WHERE id = ?")
    .bind(name, id)
    .run();

  return new Response(JSON.stringify({ id, name }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestDelete(context) {
  const { receipts_db: DB } = context.env;
  const id = context.params.id;

  const cat = await DB.prepare("SELECT name FROM categories WHERE id = ?")
    .bind(id)
    .first();
  if (!cat) {
    return new Response("ไม่พบหมวดหมู่", { status: 404 });
  }

  const count = await DB.prepare(
    "SELECT COUNT(*) as c FROM receipts WHERE category = ?"
  )
    .bind(cat.name)
    .first();

  if (count && count.c > 0) {
    return new Response(
      JSON.stringify({ error: "ไม่สามารถลบได้ เนื่องจากมีใบเสร็จใช้หมวดหมู่นี้อยู่" }),
      { status: 409, headers: { "Content-Type": "application/json" } }
    );
  }

  await DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return new Response(null, { status: 204 });
}
