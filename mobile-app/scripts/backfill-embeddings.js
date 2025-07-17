#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function getOpenAIEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });
  const data = await response.json();
  if (!data.data || !data.data[0] || !data.data[0].embedding) {
    throw new Error('Failed to get embedding from OpenAI: ' + JSON.stringify(data));
  }
  return data.data[0].embedding;
}

async function main() {
  console.log('Fetching rows with missing embeddings...');
  let { data: rows, error } = await supabase
    .from('user_restaurant_interactions')
    .select('*')
    .is('embedding', null);

  if (error) {
    console.error('Error fetching rows:', error);
    process.exit(1);
  }
  if (!rows || rows.length === 0) {
    console.log('No rows found with missing embeddings.');
    return;
  }
  console.log(`Found ${rows.length} rows to update.`);

//   let updatedCount = 0;
  for (const row of rows) {
    try {
      const inputString = row.restaurant_cuisine
        ? `${row.restaurant_name} serving ${row.restaurant_cuisine} food`
        : row.restaurant_name;
      const embedding = await getOpenAIEmbedding(inputString);

      const { error: updateError } = await supabase
        .from('user_restaurant_interactions')
        .update({ embedding })
        .eq('id', row.id);
      if (updateError) {
        console.error(`Failed to update row ${row.id}:`, updateError);
      } else {
        // updatedCount++;
        console.log(`Updated row ${row.id}`);
      }
    } catch (err) {
      console.error(`Error processing row ${row.id}:`, err.message);
    }
  }
  console.log(`finish`);
}

main(); 