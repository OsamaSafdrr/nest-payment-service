import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Payment } from './payments.entity';

@Entity('payment_attempts')
export class PaymentAttempt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Payment, (payment) => payment.attempts, { onDelete: 'CASCADE' })
  payment: Payment;

  @Column()
  attempt_number: number;

  @Column({ type: 'enum', enum: ['success', 'failure'] })
  status: 'success' | 'failure';

  @Column({ type: 'text', nullable: true })
  response: string;

  @CreateDateColumn()
  created_at: Date;
}
