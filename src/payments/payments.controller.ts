import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';

class ProcessPaymentDto {
  order_id: string;
  amount: number;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('process')
  @ApiBody({ type: ProcessPaymentDto })
  async processPayment(@Body() body: ProcessPaymentDto) {
    if (!body || !body.order_id || !body.amount) {
      throw new Error('Invalid request body');
    }
    return this.paymentsService.processPayment(body.order_id, body.amount);
  }
}
