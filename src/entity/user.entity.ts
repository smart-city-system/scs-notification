import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Base } from './base.entity';

@Entity({ name: 'users' })
export class User extends Base {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true})
  email: string;

  @Column({ select: false})
  password: string;

  @Column()
  role: string;

  @Column()
  is_active: boolean;
}