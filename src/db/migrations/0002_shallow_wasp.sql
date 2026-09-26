CREATE TABLE "teams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(60) NOT NULL,
	"short_name" varchar(6),
	"logo_url" text,
	"arena_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_arena_id_arenas_id_fk" FOREIGN KEY ("arena_id") REFERENCES "public"."arenas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "teams_arena_id_idx" ON "teams" USING btree ("arena_id");--> statement-breakpoint
CREATE UNIQUE INDEX "teams_arena_id_name_unique" ON "teams" USING btree ("arena_id","name");