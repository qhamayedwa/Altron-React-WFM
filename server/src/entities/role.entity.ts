import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 64, unique: true })
  name: string;

  @Column({ length: 255, nullable: true })
  description?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];
}
