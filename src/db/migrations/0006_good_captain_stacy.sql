ALTER TABLE "matches" ADD COLUMN "inn1_balls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "inn2_balls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "stats_applied" boolean DEFAULT false NOT NULL;