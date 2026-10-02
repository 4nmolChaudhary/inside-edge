CREATE TABLE "authorization_lock" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"session_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	CONSTRAINT "authorization_lock_single_row" CHECK ("authorization_lock"."id" = 1)
);
