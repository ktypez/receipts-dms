export async function onRequestGet(context) {
  try {
    const { request, env } = context;

    const cookie = request.headers.get("Cookie") || "";
    const match = cookie.match(/(?:^|;\s*)auth_token=([^;]+)/);
    const token = match ? match[1] : null;

    if (token && env.AUTH_PASSWORD && env.AUTH_SECRET) {
      const key = await crypto.subtle.importKey(
        "raw", new TextEncoder().encode(env.AUTH_SECRET),
        { name: "HMAC", hash: "SHA-256" },
        false, ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(env.AUTH_PASSWORD));
      const expected = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");
      if (token === expected) {
        return new Response(JSON.stringify({ authenticated: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ authenticated: false }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "check error: " + e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
