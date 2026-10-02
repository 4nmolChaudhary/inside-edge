CREATE TABLE "player_stats" (
	"player_id" uuid PRIMARY KEY NOT NULL,
	"arena_id" uuid NOT NULL,
	"matches" smallint DEFAULT 0 NOT NULL,
	"innings" smallint DEFAULT 0 NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL,
	"balls_faced" integer DEFAULT 0 NOT NULL,
	"fours" smallint DEFAULT 0 NOT NULL,
	"sixes" smallint DEFAULT 0 NOT NULL,
	"outs" smallint DEFAULT 0 NOT NULL,
	"high_score" smallint DEFAULT 0 NOT NULL,
	"high_score_not_out" boolean DEFAULT false NOT NULL,
	"fifties" smallint DEFAULT 0 NOT NULL,
	"hundreds" smallint DEFAULT 0 NOT NULL,
	"ducks" smallint DEFAULT 0 NOT NULL,
	"balls_bowled" integer DEFAULT 0 NOT NULL,
	"runs_conceded" integer DEFAULT 0 NOT NULL,
	"wickets" smallint DEFAULT 0 NOT NULL,
	"maidens" smallint DEFAULT 0 NOT NULL,
	"dots" integer DEFAULT 0 NOT NULL,
	"wides_no_balls" smallint DEFAULT 0 NOT NULL,
	"best_wickets" smallint DEFAULT 0 NOT NULL,
	"best_runs" smallint DEFAULT 0 NOT NULL,
	"three_wicket_hauls" smallint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "player_stats" ADD CONSTRAINT "player_stats_arena_id_arenas_id_fk" FOREIGN KEY ("arena_id") REFERENCES "public"."arenas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "player_stats_arena_runs_idx" ON "player_stats" USING btree ("arena_id","runs");--> statement-breakpoint
CREATE INDEX "player_stats_arena_wkts_idx" ON "player_stats" USING btree ("arena_id","wickets");