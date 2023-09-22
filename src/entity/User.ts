import { Entity, PrimaryColumn, Column, ManyToOne } from 'typeorm';
import { Owner } from './Owner';

@Entity()
export class User {
  @PrimaryColumn('text', { default: () => `${5}` })
  id: string;

  @Column()
  name: string;

  @Column('int', { default: 0 })
  videos_played: number;

  @Column({ nullable: true })
  last_played_timestamp: Date;

  @Column('text', { array: true })
  video_queue: string[];

  @ManyToOne(() => Owner, (owner: Owner) => owner.users)
  owner: Owner;
}
