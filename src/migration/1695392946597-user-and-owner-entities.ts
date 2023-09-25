import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAndOwnerEntities1695392946597 implements MigrationInterface {
  name = 'UserAndOwnerEntities1695392946597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "owner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), CONSTRAINT "PK_8e86b6b9f94aece7d12d465dc0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" text NOT NULL DEFAULT 5, "name" character varying NOT NULL, "videos_played" integer NOT NULL DEFAULT '0', "last_played_timestamp" TIMESTAMP, "video_queue" text array NOT NULL, "ownerId" uuid, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_6c19ad3671f901796d5a7395e3e" FOREIGN KEY ("ownerId") REFERENCES "owner"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_6c19ad3671f901796d5a7395e3e"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "owner"`);
  }
}
