export async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  if (!apiKey) throw new Error('OpenAI API key not set');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text
    })
  });
  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Failed to get embedding from OpenAI');
  }
  return data.data[0].embedding;
} 