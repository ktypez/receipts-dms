export async function onRequestDelete(context) {
  const { receipts_db: DB, BUCKET } = context.env;
  const id = context.params.id;

  if (!id) return new Response("ไม่พบไอดี", { status: 400 });

  await BUCKET.delete(id);
  await DB.prepare("DELETE FROM receipts WHERE id = ?").bind(id).run();

  return new Response(null, { status: 204 });
}
