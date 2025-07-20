#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;


const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const openai = new OpenAI({ apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY });


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

async function getOpenAISummary(restaurantName, restaurantCuisine) {
  let prompt;
  if (restaurantCuisine) {
    prompt = `Write a concise, one-sentence text stating the food example, or unique qualities of the restaurant '${restaurantName}', which serves ${restaurantCuisine} cuisine.`;
  } else {
    prompt = `Write a concise, one-sentence text stating the food example, or unique qualities of the restaurant '${restaurantName}'.`;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o", 
    messages: [
      { role: "system", content: "You are a helpful assistant that writes concise, one-sentence summaries for restaurants. Do not add any descriptive phrases or filler words at all cost" },
      { role: "user", content: prompt }
    ],
    max_tokens: 60,
    temperature: 0.7,
  });

  return completion.choices[0].message.content.trim();
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

  console.log(`Found ${rows.length} rows to update.`);

//   let updatedCount = 0;
  for (const row of rows) {
    try {
      const summary = await getOpenAISummary(row.restaurant_name, row.restaurant_cuisine);
      const embedding = await getOpenAIEmbedding(summary);
      let updateObj = { embedding };
      if ('summary' in row) updateObj.summary = summary;
      const { error: updateError } = await supabase
        .from('user_restaurant_interactions')
        .update(updateObj)
        .eq('id', row.id);
      if (updateError) {
        console.error(`Failed to update row ${row.id}:`, updateError);
      } else {
        console.log(`Updated row ${row.id} with summary: ${summary}`);
      }
    } catch (err) {
      console.error(`Error processing row ${row.id}:`, err.message);
    }
  }
  console.log(`finish`);
}

main(); 