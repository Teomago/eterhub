import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_design_hero_height" AS ENUM('default', 'medium', 'full');
  CREATE TYPE "public"."enum_pages_blocks_hero_2_design_hero_height" AS ENUM('default', 'medium', 'full');
  CREATE TYPE "public"."enum_pages_blocks_hero_3_design_hero_height" AS ENUM('default', 'medium', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_design_hero_height" AS ENUM('default', 'medium', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_2_design_hero_height" AS ENUM('default', 'medium', 'full');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_3_design_hero_height" AS ENUM('default', 'medium', 'full');
  ALTER TYPE "public"."enum_pages_blocks_hero_design_layout" ADD VALUE 'fullOverlay';
  ALTER TYPE "public"."enum_pages_blocks_hero_2_design_layout" ADD VALUE 'fullOverlay';
  ALTER TYPE "public"."enum_pages_blocks_hero_3_design_layout" ADD VALUE 'fullOverlay';
  ALTER TYPE "public"."enum__pages_v_blocks_hero_design_layout" ADD VALUE 'fullOverlay';
  ALTER TYPE "public"."enum__pages_v_blocks_hero_2_design_layout" ADD VALUE 'fullOverlay';
  ALTER TYPE "public"."enum__pages_v_blocks_hero_3_design_layout" ADD VALUE 'fullOverlay';
  ALTER TABLE "pages_blocks_hero" ADD COLUMN "design_hero_height" "enum_pages_blocks_hero_design_hero_height" DEFAULT 'default';
  ALTER TABLE "pages_blocks_hero_2" ADD COLUMN "design_hero_height" "enum_pages_blocks_hero_2_design_hero_height" DEFAULT 'default';
  ALTER TABLE "pages_blocks_hero_3" ADD COLUMN "design_hero_height" "enum_pages_blocks_hero_3_design_hero_height" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN "design_hero_height" "enum__pages_v_blocks_hero_design_hero_height" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_hero_2" ADD COLUMN "design_hero_height" "enum__pages_v_blocks_hero_2_design_hero_height" DEFAULT 'default';
  ALTER TABLE "_pages_v_blocks_hero_3" ADD COLUMN "design_hero_height" "enum__pages_v_blocks_hero_3_design_hero_height" DEFAULT 'default';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_hero" ALTER COLUMN "design_layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::text;
  DROP TYPE "public"."enum_pages_blocks_hero_design_layout";
  CREATE TYPE "public"."enum_pages_blocks_hero_design_layout" AS ENUM('contentLeft', 'contentRight', 'contentCenter', 'overlay');
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::"public"."enum_pages_blocks_hero_design_layout";
  ALTER TABLE "pages_blocks_hero" ALTER COLUMN "design_layout" SET DATA TYPE "public"."enum_pages_blocks_hero_design_layout" USING "design_layout"::"public"."enum_pages_blocks_hero_design_layout";
  ALTER TABLE "pages_blocks_hero_2" ALTER COLUMN "design_layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_hero_2" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::text;
  DROP TYPE "public"."enum_pages_blocks_hero_2_design_layout";
  CREATE TYPE "public"."enum_pages_blocks_hero_2_design_layout" AS ENUM('contentLeft', 'contentRight', 'contentCenter', 'overlay');
  ALTER TABLE "pages_blocks_hero_2" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::"public"."enum_pages_blocks_hero_2_design_layout";
  ALTER TABLE "pages_blocks_hero_2" ALTER COLUMN "design_layout" SET DATA TYPE "public"."enum_pages_blocks_hero_2_design_layout" USING "design_layout"::"public"."enum_pages_blocks_hero_2_design_layout";
  ALTER TABLE "pages_blocks_hero_3" ALTER COLUMN "design_layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_hero_3" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::text;
  DROP TYPE "public"."enum_pages_blocks_hero_3_design_layout";
  CREATE TYPE "public"."enum_pages_blocks_hero_3_design_layout" AS ENUM('contentLeft', 'contentRight', 'contentCenter', 'overlay');
  ALTER TABLE "pages_blocks_hero_3" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::"public"."enum_pages_blocks_hero_3_design_layout";
  ALTER TABLE "pages_blocks_hero_3" ALTER COLUMN "design_layout" SET DATA TYPE "public"."enum_pages_blocks_hero_3_design_layout" USING "design_layout"::"public"."enum_pages_blocks_hero_3_design_layout";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "design_layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_design_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_design_layout" AS ENUM('contentLeft', 'contentRight', 'contentCenter', 'overlay');
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::"public"."enum__pages_v_blocks_hero_design_layout";
  ALTER TABLE "_pages_v_blocks_hero" ALTER COLUMN "design_layout" SET DATA TYPE "public"."enum__pages_v_blocks_hero_design_layout" USING "design_layout"::"public"."enum__pages_v_blocks_hero_design_layout";
  ALTER TABLE "_pages_v_blocks_hero_2" ALTER COLUMN "design_layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_hero_2" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_2_design_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_2_design_layout" AS ENUM('contentLeft', 'contentRight', 'contentCenter', 'overlay');
  ALTER TABLE "_pages_v_blocks_hero_2" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::"public"."enum__pages_v_blocks_hero_2_design_layout";
  ALTER TABLE "_pages_v_blocks_hero_2" ALTER COLUMN "design_layout" SET DATA TYPE "public"."enum__pages_v_blocks_hero_2_design_layout" USING "design_layout"::"public"."enum__pages_v_blocks_hero_2_design_layout";
  ALTER TABLE "_pages_v_blocks_hero_3" ALTER COLUMN "design_layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_hero_3" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::text;
  DROP TYPE "public"."enum__pages_v_blocks_hero_3_design_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_hero_3_design_layout" AS ENUM('contentLeft', 'contentRight', 'contentCenter', 'overlay');
  ALTER TABLE "_pages_v_blocks_hero_3" ALTER COLUMN "design_layout" SET DEFAULT 'contentLeft'::"public"."enum__pages_v_blocks_hero_3_design_layout";
  ALTER TABLE "_pages_v_blocks_hero_3" ALTER COLUMN "design_layout" SET DATA TYPE "public"."enum__pages_v_blocks_hero_3_design_layout" USING "design_layout"::"public"."enum__pages_v_blocks_hero_3_design_layout";
  ALTER TABLE "pages_blocks_hero" DROP COLUMN "design_hero_height";
  ALTER TABLE "pages_blocks_hero_2" DROP COLUMN "design_hero_height";
  ALTER TABLE "pages_blocks_hero_3" DROP COLUMN "design_hero_height";
  ALTER TABLE "_pages_v_blocks_hero" DROP COLUMN "design_hero_height";
  ALTER TABLE "_pages_v_blocks_hero_2" DROP COLUMN "design_hero_height";
  ALTER TABLE "_pages_v_blocks_hero_3" DROP COLUMN "design_hero_height";
  DROP TYPE "public"."enum_pages_blocks_hero_design_hero_height";
  DROP TYPE "public"."enum_pages_blocks_hero_2_design_hero_height";
  DROP TYPE "public"."enum_pages_blocks_hero_3_design_hero_height";
  DROP TYPE "public"."enum__pages_v_blocks_hero_design_hero_height";
  DROP TYPE "public"."enum__pages_v_blocks_hero_2_design_hero_height";
  DROP TYPE "public"."enum__pages_v_blocks_hero_3_design_hero_height";`)
}
