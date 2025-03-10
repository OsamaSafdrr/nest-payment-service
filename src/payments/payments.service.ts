
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payments.entity';
import { PaymentAttempt } from './entities/payment-attempts.entity';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly MAX_RETRIES = 3;
  private readonly INITIAL_DELAY = 1000;

  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(PaymentAttempt)
    private readonly paymentAttemptRepository: Repository<PaymentAttempt>,
    private readonly mockPaymentGatewayService: MockPaymentGatewayService,
  ) {}

  async processPayment(orderId: string, amount: number) {
    const queryRunner = this.paymentRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();

    try {
      this.logger.debug('Starting transaction...');
      await queryRunner.startTransaction();
      this.logger.debug('Transaction started.');

      let payment = await queryRunner.manager.findOne(Payment, {
        where: { order_id: orderId },
        lock: { mode: 'pessimistic_write' },
      });

      if (payment && payment.status === 'completed') {
        throw new Error('Payment already completed');
      }

      if (!payment) {
        payment = queryRunner.manager.create(Payment, {
          order_id: orderId,
          amount,
          status: 'pending',
        });
        await queryRunner.manager.save(payment);
      }

      let attemptNumber = 1;
      let gatewayResponse;
      while (attemptNumber <= this.MAX_RETRIES) {
        try {
          gatewayResponse = await this.mockPaymentGatewayService.processPayment(orderId, amount);

          const attempt = queryRunner.manager.create(PaymentAttempt, {
            payment,
            attempt_number: attemptNumber,
            status: gatewayResponse.status,
            response: JSON.stringify(gatewayResponse),
          });
          await queryRunner.manager.save(attempt);

          if (gatewayResponse.status === 'success') {
            payment.status = 'completed';
            payment.payment_gateway_response = JSON.stringify(gatewayResponse);
            await queryRunner.manager.save(payment);
            await queryRunner.commitTransaction();
            this.logger.debug('Transaction committed successfully.');
            return gatewayResponse;
          } else {
            throw new Error('Payment failed');
          }
        } catch (error) {
          this.logger.warn(`Attempt ${attemptNumber} failed: ${error.message}`);
          attemptNumber++;

          if (attemptNumber <= this.MAX_RETRIES) {
            const delay = Math.pow(2, attemptNumber - 1) * this.INITIAL_DELAY;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      }

      payment.status = 'failed';
      payment.payment_gateway_response = JSON.stringify(gatewayResponse);
      await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();
      this.logger.debug('Transaction committed after max retries.');

      throw new Error('Payment failed after maximum retries');
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        this.logger.debug('Transaction rolled back.');
      }
      this.logger.error(`Payment processing failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
      this.logger.debug('QueryRunner released.');
    }
  }
}
