import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  ): Promise<ImageProcessingResult> {
    this.logger.log(`Received image: ${data.fileName}`);

    // Convert the imageData to Buffer if it's an array
    const imageBuffer = Buffer.isBuffer(data.imageData)
      ? data.imageData
      : Buffer.from(data.imageData);

    // Process the image
    return await this.imageProcessorService.processImage(
      imageBuffer,
      data.fileName,
    );
  }
}
