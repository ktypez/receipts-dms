export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();
    const { password } = body;

    if (!password || password !== env.AUTH_PASSWORD) {
      return new Response(JSON.stringify({ error: "Invalid password" }), {
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
    const token = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, "0")).join("");

    return new Response(JSON.stringify({ authenticated: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": `auth_token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
