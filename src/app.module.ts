import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { MinioService } from './minio.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [UploadController],
  providers: [MinioService],
})
export class AppModule {}