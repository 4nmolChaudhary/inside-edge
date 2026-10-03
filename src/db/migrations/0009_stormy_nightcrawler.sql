ALTER TABLE "matches" ADD COLUMN "player_of_match_id" uuid;--> statement-breakpoint
ALTER TABLE "player_stats" ADD COLUMN "player_of_match" smallint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "matches" ADD CONSTRAINT "matches_player_of_match_id_players_id_fk" FOREIGN KEY ("player_of_match_id") REFERENCES "public"."players"("id") ON DELETE no action ON UPDATE no action;