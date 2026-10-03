ALTER TABLE "matches" DROP CONSTRAINT "matches_innings";--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "super1_balls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD COLUMN "super2_balls" text[] DEFAULT '{}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_innings" CHECK ("matches"."current_innings" in (1, 2, 3, 4));