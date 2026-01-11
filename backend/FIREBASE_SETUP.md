# Hướng dẫn cấu hình Firebase Storage

## Bước 1: Lấy Firebase Credentials

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Chọn project **sherwoodcare-d3de5**
3. Vào **Project Settings** (icon bánh răng) > **Service Accounts**
4. Click **Generate New Private Key**
5. Download file JSON

## Bước 2: Cập nhật .env

Mở file `.env` và điền thông tin từ file JSON vừa tải:

```bash
# Firebase Configuration
FIREBASE_PROJECT_ID=sherwoodcare-d3de5
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@sherwoodcare-d3de5.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBAD...(copy toàn bộ private key)\n-----END PRIVATE KEY-----\n"
```

**Lưu ý:** Private key phải giữ nguyên định dạng `\n` (newline escaped)

## Bước 3: Tạo bảng documents trong Supabase

Chạy migration:

```bash
cd backend
node scripts/create-documents-table.js
```

Hoặc thực thi SQL trực tiếp trong Supabase SQL Editor:

```sql
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Bước 4: Test API

### Upload file:

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@path/to/your/file.pdf"
```

### Lấy danh sách file:

```bash
curl http://localhost:3000/api/upload
```

### Xóa file:

```bash
curl -X DELETE http://localhost:3000/api/upload/1
```

## Bước 5: Cấu hình CORS trên Firebase Storage

1. Vào [Firebase Console](https://console.firebase.google.com)
2. Chọn **Storage** > **Rules**
3. Cập nhật rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if true;
    }
  }
}
```

**⚠️ Chú ý:** Rule này cho phép tất cả mọi người đọc/ghi. Trong production, nên giới hạn quyền truy cập.

## Cấu trúc API Endpoints

| Method | Endpoint          | Mô tả                                            |
| ------ | ----------------- | ------------------------------------------------ |
| POST   | `/api/upload`     | Upload file (multipart/form-data với key "file") |
| GET    | `/api/upload`     | Lấy danh sách tất cả file                        |
| DELETE | `/api/upload/:id` | Xóa file theo ID                                 |

## Frontend Example (React)

```jsx
const handleFileUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:3000/api/upload", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  console.log("Upload result:", data);
};
```
