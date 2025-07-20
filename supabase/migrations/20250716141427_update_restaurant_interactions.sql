create extension if not exists vector;

alter table public.user_restaurant_interactions drop column if exists embedding;
alter table public.user_restaurant_interactions add column embedding vector(1536);
