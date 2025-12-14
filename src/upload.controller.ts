import {
  Controller,
  Post,
  Delete,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MinioService } from './minio.service';

@Controller('files')
export class UploadController {
  constructor(private readonly minioService: MinioService) {}

  @Get('admin/buckets')
  async listBuckets() {
    const buckets = await this.minioService.listBuckets();
    return { buckets };
  }

  @Delete('admin/bucket/:bucketName')
  async deleteBucket(@Param('bucketName') bucketName: string) {
    await this.minioService.deleteBucket(bucketName);
    return { success: true, message: 'Bucket deleted successfully' };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUrl = await this.minioService.uploadFile(fileName, file.buffer);
    
    return {
      success: true,
      fileName,
      fileUrl,
      message: 'File uploaded successfully',
    };
  }

  @Post('upload/:bucket')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFileToSpecificBucket(
    @Param('bucket') bucket: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUrl = await this.minioService.uploadFileToSpecificBucket(bucket, fileName, file.buffer);
    
    return {
      success: true,
      fileName,
      fileUrl,
      bucket,
      message: 'File uploaded successfully',
    };
  }

  @Get(':bucket/:fileName')
  async getFile(@Param('bucket') bucket: string, @Param('fileName') fileName: string) {
    const fileUrl = await this.minioService.getFileUrlFromBucket(bucket, fileName);
    return { fileUrl };
  }

  @Get(':fileName')
  async getFileFromDefault(@Param('fileName') fileName: string) {
    const fileUrl = await this.minioService.getFileUrl(fileName);
    return { fileUrl };
  }

  @Delete(':fileName')
  async deleteFileFromDefault(@Param('fileName') fileName: string) {
    await this.minioService.deleteFile(fileName);
    return { success: true, message: 'File deleted successfully' };
  }

  @Delete(':bucket/:fileName')
  async deleteFile(@Param('bucket') bucket: string, @Param('fileName') fileName: string) {
    await this.minioService.deleteFileFromBucket(bucket, fileName);
    return { success: true, message: 'File deleted successfully' };
  }

  @Get('bucket/:bucket/files')
  async listFilesInBucket(@Param('bucket') bucket: string) {
    const files = await this.minioService.listFilesInBucket(bucket);
    return { files, bucket };
  }

  @Get()
  async listFiles() {
    const files = await this.minioService.listFiles();
    return { files };
  }
}