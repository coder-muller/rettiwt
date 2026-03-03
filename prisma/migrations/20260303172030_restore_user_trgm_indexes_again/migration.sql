CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "user_username_trgm_idx"
  ON "user" USING GIN ("username" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "user_name_trgm_idx"
  ON "user" USING GIN ("name" gin_trgm_ops);
