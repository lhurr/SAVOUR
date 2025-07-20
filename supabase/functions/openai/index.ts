import OpenAI from 'https://deno.land/x/openai@v4.24.0/mod.ts'
import { corsHeaders } from "../_shared/cors.ts";


Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }
  try {
    const { query } = await req.json();
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    const openai = new OpenAI({ apiKey });
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant that writes concise, one-sentence summaries for restaurants." },
        { role: "user", content: query }
      ],
      max_tokens: 60,
      temperature: 0.7
    });
    const reply = chatCompletion.choices[0].message.content.trim();
    return new Response(reply, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain'
      }
    });
  } catch (e) {
    return new Response('Internal Error: ' + e.message, {
      status: 500,
      headers: corsHeaders
    });
  }
});