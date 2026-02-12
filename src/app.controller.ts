import { Controller, Logger } from '@nestjs/common';
import {
  Ctx,
  MessagePattern,
  Payload,
  RmqContext,
} from '@nestjs/microservices';
import {
  ImageProcessorService,
  ImageProcessingResult,
} from './image-processor.service';

interface ImageMessage {
  fileName: string;
  imageData: Buffer | number[];
}

@Controller()
export class AppController {
  private readonly logger = new Logger(AppController.name);

  constructor(private readonly imageProcessorService: ImageProcessorService) {}

  @MessagePattern('process_image')
  async handleImageProcessing(
    @Payload() data: ImageMessage,
    @Ctx() context: RmqContext,
  ): Promise<ImageProcessingResult> {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      this.logger.log(`Received image: ${data.fileName}`);

      const imageBuffer = Buffer.isBuffer(data.imageData)
        ? data.imageData
        : Buffer.from(data.imageData);

      const result = await this.imageProcessorService.processImage(
        imageBuffer,
        data.fileName,
      );

      channel.ack(originalMsg);
      this.logger.log(`✅ Message acknowledged for: ${data.fileName}`);

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing image ${data.fileName}: ${message}`);

      channel.nack(originalMsg, false, true);
      this.logger.log(`❌ Message requeued for retry: ${data.fileName}`);

      throw error;
    }
  }
}
