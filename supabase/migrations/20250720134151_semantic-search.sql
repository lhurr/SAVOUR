-- Create match_documents function for semantic search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  restaurant_name text,
  restaurant_address text,
  restaurant_cuisine text,
  interaction_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    uri.id,
    uri.restaurant_name,
    uri.restaurant_address,
    uri.restaurant_cuisine,
    uri.interaction_type,
    1 - (uri.embedding <=> query_embedding) as similarity
  FROM user_restaurant_interactions uri
  WHERE uri.embedding IS NOT NULL
    AND 1 - (uri.embedding <=> query_embedding) > match_threshold
  ORDER BY uri.embedding <=> query_embedding
  LIMIT match_count;
END;
$$; 