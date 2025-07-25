import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import OpenAI from "jsr:@openai/openai";
import { corsHeaders } from "../_shared/cors.ts";

const openai = new OpenAI({
  apiKey: Deno.env.get("OPENAI_API_KEY"),
});

Deno.serve(async (req) => {
  // CRITICAL: Handle OPTIONS preflight request FIRST
  // This must be at the very top of the function
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'text' field" }),
        { 
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    const embeddingResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    const embedding = embeddingResponse.data[0]?.embedding;
    if (!embedding) {
      return new Response(
        JSON.stringify({ error: "Failed to generate embedding" }),
        { 
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json"
          }
        }
      );
    }

    return new Response(JSON.stringify({ embedding }), {
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json" 
      },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});