CREATE TYPE "public"."PaymentMethod" AS ENUM('CASH', 'CREDIT_CARD');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('SUPER_ADMIN', 'ADMIN', 'USER');--> statement-breakpoint
CREATE TYPE "public"."SaleStatus" AS ENUM('PENDING', 'CONCLUDED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."Status" AS ENUM('ACTIVE', 'INACTIVE');--> statement-breakpoint
CREATE TABLE "product" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"barCode" varchar(100) NOT NULL,
	"price" real NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"active" "Status" DEFAULT 'ACTIVE' NOT NULL,
	"createdBy" integer NOT NULL,
	"updatedBy" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saleProduct" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"saleId" uuid NOT NULL,
	"productId" uuid NOT NULL,
	"quantity" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sellerId" integer NOT NULL,
	"paymentMethod" "PaymentMethod" NOT NULL,
	"total" real NOT NULL,
	"amountReceived" real NOT NULL,
	"change" real NOT NULL,
	"saleDate" timestamp with time zone DEFAULT now() NOT NULL,
	"status" "SaleStatus" DEFAULT 'PENDING' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"role" "Role" DEFAULT 'USER',
	"email" varchar(255),
	"createdAt" timestamp with time zone DEFAULT now(),
	"updatedAt" timestamp with time zone DEFAULT now(),
	"active" "Status" DEFAULT 'ACTIVE'
);
--> statement-breakpoint
CREATE INDEX "product_barCode_idx" ON "product" USING btree ("barCode");