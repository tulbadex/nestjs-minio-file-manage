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
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        return [];
      }
      
      const files: string[] = [];
      const stream = this.minioClient.listObjects(bucketName, '', true);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => obj.name && files.push(obj.name));
        stream.on('end', () => resolve(files));
        stream.on('error', () => resolve([]));
      });
    } catch (error) {
      return [];
    }
  }

  async getFileUrlFromBucket(bucketName: string, fileName: string): Promise<string> {
    try {
      const exists = await this.minioClient.bucketExists(bucketName);
      if (!exists) {
        throw new Error('Bucket does not exist');
      }
      return await this.minioClient.presignedGetObject(bucketName, fileName, 24 * 60 * 60);
    } catch (error) {
      throw error;
    }
  }

  async deleteFileFromBucket(bucketName: string, fileName: string): Promise<void> {
    await this.minioClient.removeObject(bucketName, fileName);
  }

  async deleteBucket(bucketName: string): Promise<void> {
    // First, delete all objects in the bucket
    const objectsList = this.minioClient.listObjects(bucketName, '', true);
    const objectsToDelete: string[] = [];
    
    return new Promise((resolve, reject) => {
      objectsList.on('data', (obj) => {
        if (obj.name) objectsToDelete.push(obj.name);
      });
      
      objectsList.on('end', async () => {
        try {
          // Delete all objects first
          if (objectsToDelete.length > 0) {
            await this.minioClient.removeObjects(bucketName, objectsToDelete);
          }
          // Then delete the bucket
          await this.minioClient.removeBucket(bucketName);
          resolve();
        } catch (error) {
          reject(error);
        }
      });
      
      objectsList.on('error', reject);
    });
  }

  async listBuckets(): Promise<string[]> {
    try {
      const buckets = await this.minioClient.listBuckets();
      console.log('MinIO buckets:', buckets);
      // Filter buckets with deenai- prefix
      const deenaiBuckets = buckets
        .map(bucket => bucket.name)
        .filter(name => name.startsWith('deenai-'));
      
      console.log('Filtered deenai buckets:', deenaiBuckets);
      return deenaiBuckets;
    } catch (error) {
      console.error('Error listing buckets:', error);
      // Return empty array if listing fails
      return [];
    }
  }

  private async ensureSpecificBucket(bucketName: string) {
    const exists = await this.minioClient.bucketExists(bucketName);
    if (!exists) {
      await this.minioClient.makeBucket(bucketName);
    }
  }
}