import { Entity, PrimaryGeneratedColumn, OneToMany, JoinTable } from 'typeorm';
import { User } from './User';

@Entity()
export class Owner {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => User, (user: User) => user.owner, { eager: true })
  @JoinTable()
  users: User[];
}
