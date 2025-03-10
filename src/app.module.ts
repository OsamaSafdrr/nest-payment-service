import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Payment } from './payments/entities/payments.entity';
import { PaymentAttempt } from './payments/entities/payment-attempts.entity';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Payment, PaymentAttempt],
      synchronize: true,
    }),
    PaymentsModule,
  ],
})
export class AppModule {
  static setupSwagger(app) {
    const config = new DocumentBuilder()
      .setTitle('Payment API')
      .setDescription('API documentation for the Payment Processing System')
      .setVersion('1.0')
      .addTag('payments')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
}
