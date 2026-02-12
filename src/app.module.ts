import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ImageProcessorService } from './image-processor.service';

@Module({
  controllers: [AppController],
  providers: [ImageProcessorService],
})
export class AppModule {}
