import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { promises as fs } from 'fs';
import * as path from 'path';

export interface ImageProcessingResult {
  original: string;
  optimized: {
    webp: string;
    avif: string;
    jpeg: string;
    png: string;
  };
}

@Injectable()
export class ImageProcessorService {
  private readonly logger = new Logger(ImageProcessorService.name);
  private readonly outputDir = path.join(process.cwd(), 'output');

  async processImage(
    imageData: Buffer,
    fileName: string,
  ): Promise<ImageProcessingResult> {
    try {
      this.logger.log(`Processing image: ${fileName}`);

      // Ensure output directory exists
      await this.ensureOutputDir();

      const baseName = path.parse(fileName).name;
      const timestamp = Date.now();

      // Create optimized versions in different formats
      const results = await Promise.all([
        this.createWebP(imageData, `${baseName}-${timestamp}.webp`),
        this.createAVIF(imageData, `${baseName}-${timestamp}.avif`),
        this.createOptimizedJPEG(imageData, `${baseName}-${timestamp}.jpg`),
        this.createOptimizedPNG(imageData, `${baseName}-${timestamp}.png`),
      ]);

      const result: ImageProcessingResult = {
        original: fileName,
        optimized: {
          webp: results[0],
          avif: results[1],
          jpeg: results[2],
          png: results[3],
        },
      };

      this.logger.log(`Successfully processed image: ${fileName}`);
      this.logger.log(
        `Output files: ${JSON.stringify(result.optimized, null, 2)}`,
      );

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Error processing image ${fileName}: ${message}`);
      throw error;
    }
  }

  private async ensureOutputDir(): Promise<void> {
    try {
      await fs.access(this.outputDir);
    } catch {
      await fs.mkdir(this.outputDir, { recursive: true });
    }
  }

  private async createWebP(
    imageData: Buffer,
    fileName: string,
  ): Promise<string> {
    const outputPath = path.join(this.outputDir, fileName);

    await sharp(imageData).webp({ quality: 80, effort: 6 }).toFile(outputPath);

    const stats = await fs.stat(outputPath);
    this.logger.log(
      `Created WebP: ${fileName} (${this.formatBytes(stats.size)})`,
    );

    return outputPath;
  }

  private async createAVIF(
    imageData: Buffer,
    fileName: string,
  ): Promise<string> {
    const outputPath = path.join(this.outputDir, fileName);

    await sharp(imageData).avif({ quality: 80, effort: 6 }).toFile(outputPath);

    const stats = await fs.stat(outputPath);
    this.logger.log(
      `Created AVIF: ${fileName} (${this.formatBytes(stats.size)})`,
    );

    return outputPath;
  }

  private async createOptimizedJPEG(
    imageData: Buffer,
    fileName: string,
  ): Promise<string> {
    const outputPath = path.join(this.outputDir, fileName);

    await sharp(imageData)
      .jpeg({ quality: 85, progressive: true, mozjpeg: true })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    this.logger.log(
      `Created JPEG: ${fileName} (${this.formatBytes(stats.size)})`,
    );

    return outputPath;
  }

  private async createOptimizedPNG(
    imageData: Buffer,
    fileName: string,
  ): Promise<string> {
    const outputPath = path.join(this.outputDir, fileName);

    await sharp(imageData)
      .png({ quality: 85, compressionLevel: 9, palette: true })
      .toFile(outputPath);

    const stats = await fs.stat(outputPath);
    this.logger.log(
      `Created PNG: ${fileName} (${this.formatBytes(stats.size)})`,
    );

    return outputPath;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }
}
