export async function onRequestGet(context) {
  const { BUCKET } = context.env;
  const url = new URL(context.request.url);
  const id = url.pathname.split("/").pop();
  const obj = await BUCKET.get(id);
  if (!obj) return new Response("ไม่พบไฟล์", { status: 404 });

  return new Response(obj.body, {
    headers: {
      "Content-Type": obj.httpMetadata?.contentType ?? "application/octet-stream",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
