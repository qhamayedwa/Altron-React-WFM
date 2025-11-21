import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from './region.entity';

@Entity('companies')
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10, unique: true })
  code: string;

  @Column({ name: 'legal_name', length: 150, nullable: true })
  legalName?: string;

  @Column({ name: 'registration_number', length: 50, nullable: true })
  registrationNumber?: string;

  @Column({ name: 'tax_number', length: 50, nullable: true })
  taxNumber?: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ length: 100, nullable: true })
  website?: string;

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
  country?: string;

  @Column({ length: 50, nullable: true })
  timezone?: string;

  @Column({ length: 3, nullable: true })
  currency?: string;

  @Column({ name: 'fiscal_year_start', type: 'int', nullable: true })
  fiscalYearStart?: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @OneToMany(() => Region, (region) => region.company)
  regions: Region[];
}
