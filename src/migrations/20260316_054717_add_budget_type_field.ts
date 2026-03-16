import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_budgets_budget_type" AS ENUM('expense', 'income');
  ALTER TABLE "budgets" ADD COLUMN "budget_type" "enum_budgets_budget_type" DEFAULT 'expense' NOT NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "budgets" DROP COLUMN "budget_type";
  DROP TYPE "public"."enum_budgets_budget_type";`)
}
