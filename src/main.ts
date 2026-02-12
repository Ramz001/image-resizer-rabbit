import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://localhost:5672'],
        queue: 'images_queue',
        noAck: false,
        queueOptions: {
          durable: true,
        },
      },
    },
  );
  app.enableShutdownHooks();
  await app.listen();
  console.log('Image processing microservice is listening for messages...');
}

void bootstrap();
