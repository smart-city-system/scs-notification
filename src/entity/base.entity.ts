import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from "typeorm"
export class Base {
  @Column({ nullable: true, select: false })
  created_by: string

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date

  @Column({ nullable: true, select: false })
  updated_by?: string

  @UpdateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP", select: false })
  updated_at: Date

  @Column({ nullable: true, select: false })
  deleted_by?: string

  @DeleteDateColumn({ type: "timestamptz", nullable: true, select: false })
  deleted_at?: Date
}
