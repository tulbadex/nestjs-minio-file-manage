import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useStaticAssets(join(__dirname, '..', 'public'));
  await app.listen(3001);
  console.log('MinIO Upload Test running on http://localhost:3001');
  console.log('Frontend available at http://localhost:3001');
}
bootstrap();