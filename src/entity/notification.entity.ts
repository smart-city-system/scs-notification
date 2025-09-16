import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Base } from "./base.entity";

@Entity({name: "notifications"})
export class Notification extends Base {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  message: string;

  @Column()
  user_id: string

  @Column()
  is_read: boolean;

  @Column()
  type: string;

  @Column({ nullable: true, type:'jsonb'})
  metadata?: string;

}