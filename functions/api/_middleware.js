export async function onRequest(context) {
  try {
    const { request, env } = context;
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/auth/")) {
      return context.next();
    }

    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token || !env.AUTH_PASSWORD || !env.AUTH_SECRET) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const key = await crypto.subtle.importKey(
      "raw", new TextEncoder().encode(env.AUTH_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false, ["sign"]
    );
    const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(env.AUTH_PASSWORD));
    const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

    if (token !== expected) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return context.next();
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
