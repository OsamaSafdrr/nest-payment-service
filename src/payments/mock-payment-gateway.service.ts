import { Injectable } from '@nestjs/common';

@Injectable()
export class MockPaymentGatewayService {
  async processPayment(orderId: string, amount: number): Promise<any> {
    const isSuccess = Math.random() > 0.5; 

    if (isSuccess) {
      return {
        status: 'success',
        transaction_id: `txn-${Math.floor(Math.random() * 100000)}`,
      };
    } else {
      return {
        status: 'failure',
        error: 'Payment failed',
      };
    }
  }
}