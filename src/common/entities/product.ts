import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Tenant } from './tenant';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal')
  price: number;

  @Column({ default: null })
  tenantId: number;

  @ManyToOne(() => Tenant, (tenant) => tenant.id)
  tenant: Tenant;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
