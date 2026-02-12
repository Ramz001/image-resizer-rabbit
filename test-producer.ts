/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import amqp from 'amqplib';
import { promises as fs } from 'fs';
import * as path from 'path';

async function sendImageToQueue(imagePath: string): Promise<void> {
  let connection;
  try {
    // Connect to RabbitMQ
    connection = await amqp.connect('amqp://localhost:5672');
    const channel = await connection.createChannel();

    const queue = 'images_queue';

    // Assert the queue exists
    await channel.assertQueue(queue, {
      durable: true,
    });

    // Read the image file
    const imageBuffer = await fs.readFile(imagePath);
    const fileName = path.basename(imagePath);

    // Create the message payload
    const message = {
      pattern: 'process_image',
      data: {
        fileName: fileName,
        imageData: Array.from(imageBuffer),
      },
    };

    // Send the message to the queue
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`✅ Sent image ${fileName} to queue`);

    // Close the connection
    await new Promise((resolve) => setTimeout(resolve, 500));
    await connection.close();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error sending image to queue:', message);
    if (connection) {
      await connection.close();
    }
    process.exit(1);
  }
}

// Usage: npx ts-node test-producer.ts path/to/image.jpg
const imagePath = process.argv[2];

if (!imagePath) {
  console.error('❌ Please provide an image path as argument');
  console.log('Usage: npx ts-node test-producer.ts path/to/image.jpg');
  process.exit(1);
}

void sendImageToQueue(imagePath);
