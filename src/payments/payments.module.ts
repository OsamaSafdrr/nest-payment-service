import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payments.entity';
import { PaymentAttempt } from './entities/payment-attempts.entity';
import { MockPaymentGatewayService } from './mock-payment-gateway.service';
import { PaymentsController } from './payments.controller';
@Module({
  imports: [TypeOrmModule.forFeature([Payment, PaymentAttempt])],
  controllers: [PaymentsController],
  providers: [PaymentsService, MockPaymentGatewayService],
})
export class PaymentsModule {}