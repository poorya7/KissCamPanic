import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SECRET = "SALT123"; // Shared with frontend

function withCORS(res: Response) {
  const headers = new Headers(res.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return new Response(res.body, { status: res.status, headers });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return withCORS(new Response(null, { status: 204 }));
  }

  try {
    const { name, score, timestamp, hash } = await req.json();

    if (!name || !score || !timestamp || !hash) {
      return withCORS(
        new Response(JSON.stringify({ error: "Missing fields" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    const data = `${name}:${score}:${timestamp}`;
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      hexToBytes(hash),
      encoder.encode(data)
    );

    if (!isValid) {
      return withCORS(
        new Response(JSON.stringify({ error: "Invalid hash" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    const now = Date.now();
    if (Math.abs(now - timestamp) > 60_000) {
      return withCORS(
        new Response(JSON.stringify({ error: "Timestamp expired" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    console.log("📝 Inserting score into highscores:", { name, score, timestamp, hash });

    const { error } = await supabase.from("highscores").insert([
      { name, score, timestamp, hash },
    ]);

    if (error) {
      console.error("❌ Insert error:", error.message);
      return withCORS(
        new Response(JSON.stringify({ error: "Insert failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        })
      );
    }

    return withCORS(
      new Response(JSON.stringify({ success: true, message: "Score accepted" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );
  } catch (err) {
    console.error("Error:", err);
    return withCORS(
      new Response(JSON.stringify({ error: "Bad request" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    );
  }
});

function hexToBytes(hex: string): Uint8Array {
  return new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
}
