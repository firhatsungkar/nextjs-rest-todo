import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({ name: 'todos' })
export class Todo {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 200 })
  task!: string;

  @Column({ default: false })
  done?: boolean;

  @UpdateDateColumn()
  updatedAt!: string;

  @CreateDateColumn()
  createdAt!: string;
}