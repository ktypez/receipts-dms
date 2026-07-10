export async function onRequestGet(context) {
  const { BUCKET } = context.env;
  const id = context.params.id;
  const obj = await BUCKET.get(id);
  if (!obj) return new Response("ไม่พบไฟล์", { status: 404 });

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
