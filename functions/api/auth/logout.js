export async function onRequestPost(context) {
  return new Response(JSON.stringify({ authenticated: false }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": "auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0",
    },
  });
}
