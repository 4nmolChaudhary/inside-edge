CREATE TABLE "team" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"short_name" text NOT NULL,
	"logo" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
