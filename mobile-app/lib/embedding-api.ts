export async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseKey) throw new Error('Supabase anon key not set');

  const response = await fetch('https://inywlsnrkrkoyhhtmbgq.supabase.co/functions/v1/embed', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${supabaseKey}`,
    },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) {
    throw new Error(`Failed to get embedding from Supabase Edge Function: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.embedding || !Array.isArray(data.embedding)) {
    throw new Error('Invalid embedding response from Supabase Edge Function');
  }
  return data.embedding;
} 