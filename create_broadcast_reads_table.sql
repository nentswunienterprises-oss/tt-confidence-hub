-- Create broadcast_reads table to track which broadcasts users have read
CREATE TABLE "broadcast_reads" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" varchar NOT NULL REFERENCES "users"("id"),
  "broadcast_id" varchar NOT NULL REFERENCES "broadcasts"("id"),
  "read_at" timestamp NOT NULL DEFAULT NOW(),
  UNIQUE("user_id", "broadcast_id")
);

-- Create index for faster queries
CREATE INDEX "broadcast_reads_user_idx" ON "broadcast_reads"("user_id");
CREATE INDEX "broadcast_reads_broadcast_idx" ON "broadcast_reads"("broadcast_id");
