import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { Site } from './site.entity';

@Entity('regions')
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'company_id' })
  companyId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 })
  code: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'manager_name', length: 100, nullable: true })
  managerName?: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'address_line1', length: 100, nullable: true })
  addressLine1?: string;

  @Column({ name: 'address_line2', length: 100, nullable: true })
  addressLine2?: string;

  @Column({ length: 50, nullable: true })
  city?: string;

  @Column({ name: 'state_province', length: 50, nullable: true })
  stateProvince?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  @Column({ length: 50, nullable: true })
  timezone?: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Company, (company) => company.regions)
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @OneToMany(() => Site, (site) => site.region)
  sites: Site[];
}
