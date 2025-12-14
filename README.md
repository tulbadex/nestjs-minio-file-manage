# NestJS MinIO File Manager 🚀

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MinIO](https://img.shields.io/badge/MinIO-C72E49?style=for-the-badge&logo=minio&logoColor=white)](https://min.io/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

A complete **NestJS** application demonstrating **MinIO** object storage integration with file upload, download, delete operations, and multi-bucket support. Perfect for learning cloud storage implementation in modern Node.js applications.

## ✨ Features

- 📁 **File Upload/Download/Delete** - Complete CRUD operations
- 🗂️ **Multi-Bucket Support** - Organize files across different buckets
- 🌐 **Web Interface** - Built-in HTML frontend for testing
- 🔒 **Environment Configuration** - Secure credential management
- 🚀 **Auto Bucket Creation** - Automatically creates buckets if they don't exist
- 📋 **File Listing** - View all uploaded files with metadata
- 🔗 **Presigned URLs** - Secure temporary file access
- ⚡ **Real-time Updates** - Dynamic file list updates

## 🛠️ Tech Stack

- **Backend**: NestJS, TypeScript
- **Storage**: MinIO (S3-compatible)
- **Frontend**: Vanilla HTML/CSS/JavaScript
- **Configuration**: @nestjs/config with .env support

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MinIO server (local or cloud)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/nestjs-minio-file-manager.git
   cd nestjs-minio-file-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MinIO credentials
   ```

4. **Start the application**
   ```bash
   npm run start:dev
   ```

5. **Open your browser**
   ```
   http://localhost:3001
   ```

## 📋 API Endpoints

### File Operations
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/files/upload` | Upload file to default bucket |
| `POST` | `/files/upload/:bucket` | Upload file to specific bucket |
| `GET` | `/files` | List all files in default bucket |
| `GET` | `/files/admin/buckets` | List all buckets with prefix filter |
| `GET` | `/files/bucket/:bucket/files` | List files in specific bucket |
| `GET` | `/files/:bucket/:fileName` | Get presigned URL for file |
| `DELETE` | `/files/:bucket/:fileName` | Delete specific file |
| `DELETE` | `/files/admin/bucket/:bucket` | Delete bucket (empties first) |

### Example Usage

#### Upload File
```bash
curl -X POST http://localhost:3001/files/upload \
  -F "file=@document.pdf"
```

#### Upload to Specific Bucket
```bash
curl -X POST http://localhost:3001/files/upload/documents \
  -F "file=@contract.pdf"
```

#### List All Buckets
```bash
curl http://localhost:3001/files/admin/buckets
```

#### List Files in Bucket
```bash
curl http://localhost:3001/files/bucket/images/files
```

#### Get File URL
```bash
curl http://localhost:3001/files/images/photo.jpg
```

#### Delete File
```bash
curl -X DELETE http://localhost:3001/files/documents/contract.pdf
```

#### Delete Bucket
```bash
curl -X DELETE http://localhost:3001/files/admin/bucket/documents
```

## 🗂️ Multi-Bucket Support

This application supports multiple buckets for better file organization:

```typescript
// Different buckets for different file types
const buckets = {
  images: 'user-images',
  documents: 'user-documents', 
  videos: 'user-videos',
  backups: 'system-backups'
};
```

### Bucket Configuration

Update your `.env` file:
```env
MINIO_DEFAULT_BUCKET=uploads
MINIO_IMAGES_BUCKET=images
MINIO_DOCUMENTS_BUCKET=documents
MINIO_VIDEOS_BUCKET=videos
```

## ⚙️ Configuration

### Environment Variables

```env
# MinIO Configuration
MINIO_ENDPOINT=your-minio-endpoint.com
MINIO_PORT=443
MINIO_USE_SSL=true
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key

# Bucket Configuration
MINIO_BUCKET_NAME=default-uploads
MINIO_IMAGES_BUCKET=images
MINIO_DOCUMENTS_BUCKET=documents
```

### MinIO Setup

1. **Local MinIO** (Development)
   ```bash
   docker run -p 9000:9000 -p 9001:9001 \
     -e "MINIO_ROOT_USER=minioadmin" \
     -e "MINIO_ROOT_PASSWORD=minioadmin" \
     minio/minio server /data --console-address ":9001"
   ```

2. **Cloud MinIO** (Production)
   - Use MinIO Cloud or AWS S3
   - Update endpoint and credentials in `.env`

## 🧪 Testing

### Web Interface
Open `http://localhost:3001` for the built-in file manager interface.

### Frontend Integration
```javascript
// Upload file example
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch('/files/upload/images', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('File uploaded:', result.fileName);
```

## 📁 Project Structure

```
src/
├── upload.controller.ts    # File upload/download endpoints
├── minio.service.ts       # MinIO client and operations
├── app.module.ts          # Main application module
└── main.ts               # Application entry point

public/
└── index.html            # Web interface for testing

.env.example              # Environment template
package.json             # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [NestJS Documentation](https://docs.nestjs.com/)
- [MinIO Documentation](https://docs.min.io/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🏷️ Tags

`nestjs` `minio` `typescript` `file-upload` `object-storage` `s3-compatible` `cloud-storage` `nodejs` `backend` `api`

---

⭐ **Star this repository if it helped you!**