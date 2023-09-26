import { Entity, PrimaryColumn, Column, ManyToOne, BeforeInsert } from 'typeorm';
import { Owner } from './Owner';
import { randomUUID } from 'crypto';

@Entity()
export class User {
  @PrimaryColumn('text')
  id: string;

  @BeforeInsert()
  setId() {
    this.id = randomUUID().substring(0, 6);
  }

  @Column()
  name: string;

  @Column('text', { array: true })
  video_queue: string[];

  @Column('text')
  ownerId: string;

  @ManyToOne(() => Owner, (owner: Owner) => owner.users)
  owner: Owner;
}
