import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class MinioService {
  private minioClient: Minio.Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    const accessKey = this.configService.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.configService.get<string>('MINIO_SECRET_KEY');
    
    if (!endpoint || !accessKey || !secretKey) {
      throw new Error('MinIO configuration missing. Please check your .env file.');
    }
    
    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'uploads';
    this.minioClient = new Minio.Client({
      endPoint: endpoint,
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '443'),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey,
      secretKey,
    });
    this.ensureBucket();
  }

  private async ensureBucket() {
    const exists = await this.minioClient.bucketExists(this.bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(this.bucketName);
    }
  }

  async uploadFile(fileName: string, fileBuffer: Buffer): Promise<string> {
    await this.minioClient.putObject(this.bucketName, fileName, fileBuffer);
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    return `https://${endpoint}/${this.bucketName}/${fileName}`;
  }

  async deleteFile(fileName: string): Promise<void> {
    await this.minioClient.removeObject(this.bucketName, fileName);
  }

  async getFileUrl(fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(this.bucketName, fileName, 24 * 60 * 60);
  }

  async listFiles(): Promise<string[]> {
    const files: string[] = [];
    const stream = this.minioClient.listObjects(this.bucketName, '', true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => obj.name && files.push(obj.name));
      stream.on('end', () => resolve(files));
      stream.on('error', reject);
    });
  }

  async uploadFileToSpecificBucket(bucketName: string, fileName: string, fileBuffer: Buffer): Promise<string> {
    await this.ensureSpecificBucket(bucketName);
    await this.minioClient.putObject(bucketName, fileName, fileBuffer);
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT');
    return `https://${endpoint}/${bucketName}/${fileName}`;
  }

  async listFilesInBucket(bucketName: string): Promise<string[]> {
    const files: string[] = [];
    const stream = this.minioClient.listObjects(bucketName, '', true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => obj.name && files.push(obj.name));
      stream.on('end', () => resolve(files));
      stream.on('error', reject);
    });
  }

  async getFileUrlFromBucket(bucketName: string, fileName: string): Promise<string> {
    return await this.minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
  }

  async deleteFileFromBucket(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  private async ensureSpecificBucket(bucketName: string) {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }
}