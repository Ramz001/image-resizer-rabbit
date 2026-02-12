import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  it('should be defined', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    expect(moduleFixture).toBeDefined();
  });
});
