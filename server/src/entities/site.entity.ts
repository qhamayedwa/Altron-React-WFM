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
import { Region } from './region.entity';
import { Department } from './department.entity';

@Entity('sites')
export class Site {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'region_id' })
  regionId: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 10 })
  code: string;

  @Column({ name: 'site_type', length: 50, nullable: true })
  siteType?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'manager_name', length: 100, nullable: true })
  managerName?: string;

  @Column({ length: 120, nullable: true })
  email?: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ name: 'address_line1', length: 100 })
  addressLine1: string;

  @Column({ name: 'address_line2', length: 100, nullable: true })
  addressLine2?: string;

  @Column({ length: 50 })
  city: string;

  @Column({ name: 'state_province', length: 50, nullable: true })
  stateProvince?: string;

  @Column({ name: 'postal_code', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'float', nullable: true })
  latitude?: number;

  @Column({ type: 'float', nullable: true })
  longitude?: number;

  @Column({ name: 'geo_fence_radius', type: 'int', nullable: true })
  geoFenceRadius?: number;

  @Column({ name: 'operating_hours_start', type: 'time', nullable: true })
  operatingHoursStart?: Date;

  @Column({ name: 'operating_hours_end', type: 'time', nullable: true })
  operatingHoursEnd?: Date;

  @Column({ length: 50, nullable: true })
  timezone?: string;

  @Column({ name: 'allow_remote_work', default: false })
  allowRemoteWork: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Region, (region) => region.sites)
  @JoinColumn({ name: 'region_id' })
  region: Region;

  @OneToMany(() => Department, (department) => department.site)
  departments: Department[];
}
