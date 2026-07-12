export async function onRequestPut(context) {
  const { receipts_db: DB } = context.env;
  const id = context.params.id;

  if (!id) return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });

  const body = await context.request.json();
  const { filename, category, owner, notes } = body;

  if (filename !== undefined) {
    if (typeof filename !== "string" || !filename.trim()) {
      return new Response(JSON.stringify({ error: "Invalid filename" }), { status: 400 });
    }
    await DB.prepare("UPDATE receipts SET filename = ? WHERE id = ?").bind(filename.trim(), id).run();
  }

  if (category !== undefined) {
    if (typeof category !== "string" || !category.trim()) {
      return new Response(JSON.stringify({ error: "Invalid category" }), { status: 400 });
    }
    const cat = await DB.prepare("SELECT name FROM categories WHERE name = ?").bind(category.trim()).first();
    if (!cat) {
      return new Response(JSON.stringify({ error: "Category not found" }), { status: 400 });
    }
    await DB.prepare("UPDATE receipts SET category = ? WHERE id = ?").bind(category.trim(), id).run();
  }

  if (notes !== undefined) {
    await DB.prepare("UPDATE receipts SET notes = ? WHERE id = ?").bind(notes, id).run();
  }

  if (owner !== undefined) {
    const value = owner === null ? null : String(owner).trim();
    await DB.prepare("UPDATE receipts SET owner = ? WHERE id = ?").bind(value || null, id).run();
  }

  return new Response(JSON.stringify({ id }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestDelete(context) {
  const { receipts_db: DB, BUCKET } = context.env;
  const id = context.params.id;

  if (!id) return new Response("ไม่พบไอดี", { status: 400 });

  await BUCKET.delete(id);
  await DB.prepare("DELETE FROM receipts WHERE id = ?").bind(id).run();

  return new Response(null, { status: 204 });
}
