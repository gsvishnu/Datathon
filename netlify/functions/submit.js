export default async (req, context) => {
  // Only allow POST
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // CORS headers — tighten the origin in production if you want
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_KEY;

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: "Server misconfigured" }), { status: 500, headers });
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/submissions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation",
    },
    body: JSON.stringify({ data: body }),
  });

  if (!response.ok) {
    const err = await response.text();
    return new Response(JSON.stringify({ error: "Database error", detail: err }), { status: 502, headers });
  }

  const saved = await response.json();
  return new Response(JSON.stringify({ success: true, id: saved[0]?.id }), { status: 200, headers });
};

export const config = {
  path: "/api/submit",
};
