CREATE TABLE "posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"user_id" uuid NOT NULL,
	"author_username" text NOT NULL,
	"image" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "vehicle_brands" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vehicles" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vehicle_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "vehicle_fuel_types" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "vehicle_brands" CASCADE;--> statement-breakpoint
DROP TABLE "vehicles" CASCADE;--> statement-breakpoint
DROP TABLE "vehicle_categories" CASCADE;--> statement-breakpoint
DROP TABLE "vehicle_fuel_types" CASCADE;--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "carnet" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_category_categories_name_fk" FOREIGN KEY ("category") REFERENCES "public"."categories"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "first_name";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "last_name";--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_carnet_unique" UNIQUE("carnet");