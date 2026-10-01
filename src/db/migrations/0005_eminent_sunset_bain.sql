CREATE TYPE "public"."match_status" AS ENUM('setup', 'live', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."toss_decision" AS ENUM('bat', 'bowl');--> statement-breakpoint
CREATE TABLE "matches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"arena_id" uuid NOT NULL,
	"team_a_id" uuid NOT NULL,
	"team_b_id" uuid NOT NULL,
	"overs" smallint NOT NULL,
	"team_a_player_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"team_b_player_ids" uuid[] DEFAULT '{}'::uuid[] NOT NULL,
	"team_a_captain_id" uuid,
	"team_b_captain_id" uuid,
	"toss_winner_id" uuid,
	"toss_decision" "toss_decision",
	"batting_first_id" uuid,
	"status" "match_status" DEFAULT 'setup' NOT NULL,
	"current_innings" smallint DEFAULT 1 NOT NULL,
	"team_a_runs" smallint DEFAULT 0 NOT NULL,
	"team_a_wickets" smallint DEFAULT 0 NOT NULL,
	"team_a_balls" smallint DEFAULT 0 NOT NULL,
	"team_b_runs" smallint DEFAULT 0 NOT NULL,
	"team_b_wickets" smallint DEFAULT 0 NOT NULL,
	"team_b_balls" smallint DEFAULT 0 NOT NULL,
	"winner_id" uuid,
	"result_text" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	CONSTRAINT "matches_diff_teams" CHECK ("matches"."team_a_id" <> "matches"."team_b_id"),
	CONSTRAINT "matches_innings" CHECK ("matches"."current_innings" in (1, 2))
);
--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_arena_id_arenas_id_fk" FOREIGN KEY ("arena_id") REFERENCES "public"."arenas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_id_teams_id_fk" FOREIGN KEY ("team_a_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_id_teams_id_fk" FOREIGN KEY ("team_b_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_a_captain_id_players_id_fk" FOREIGN KEY ("team_a_captain_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_team_b_captain_id_players_id_fk" FOREIGN KEY ("team_b_captain_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_toss_winner_id_teams_id_fk" FOREIGN KEY ("toss_winner_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_batting_first_id_teams_id_fk" FOREIGN KEY ("batting_first_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_winner_id_teams_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "matches_arena_status_idx" ON "matches" USING btree ("arena_id","status","created_at");