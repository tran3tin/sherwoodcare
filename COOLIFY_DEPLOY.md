# Deploy SherwoodCare lên Coolify

Hướng dẫn deploy toàn bộ dự án (Backend + Frontend + MySQL) lên Coolify
với cấu hình MySQL và **local disk storage** (không dùng Firebase/Supabase).

## Prerequisites

- [Coolify](https://coolify.io) đã self-hosted hoặc dùng cloud
- MySQL 8.x (Coolify **Databases → MySQL**, hoặc MySQL ngoài)
- Repo đã push lên Git (GitHub/GitLab/Gitea)

## Tổng quan kiến trúc

```
┌──────────────┐     ┌───────────────────────────────────┐     ┌──────────────┐
│   Frontend    │────▶│        Coolify                    │────▶│    MySQL     │
│  (React/Vite) │     │  ┌─────────────────────────────┐  │     │   Database   │
│  Static Site  │     │  │  Service: sherwoodcare-fe   │  │     │  nexgenus    │
│               │     │  └─────────────────────────────┘  │     └──────────────┘
│               │     │  ┌─────────────────────────────┐  │
│               │◀────│  │  Service: sherwoodcare-be   │  │
│               │     │  │  + Persistent Volume        │  │
│               │     │  │    /app/backend/public/uploads │
└──────────────┘     │  └─────────────────────────────┘  │
                     └───────────────────────────────────┘
```

| Service           | Type               | Port | Tech        |
|-------------------|--------------------|------|-------------|
| `sherwoodcare-fe` | Public / Static    | 80   | Vite React  |
| `sherwoodcare-be` | Public / Node.js   | 3000 | Express API |
| `nexgenus-db`     | Private / Database | 3306 | MySQL 8.x   |

## Bước 1: Tạo MySQL Database

### Cách A: Coolify Databases

1. Coolify → **Databases** → **+ Add** → **MySQL**
2. Điền:
   - **Name**: `nexgenus-db`
   - **Default Database**: `nexgenus`
   - **Username** / **Password**: tùy chọn
   - **Port**: `3306`
3. **Create** → copy **Connection URL**:

   ```
   mysql://nexgenus_user:MatKhau@InternalIP:3306/nexgenus
   ```

   `InternalIP` là IP nội bộ Docker của Coolify (VD `172.19.0.2`), **không** phải `127.0.0.1`.

### Cách B: MySQL ngoài

```
mysql://user:password@host:3306/nexgenus
```

MySQL phải cho phép kết nối từ mạng Docker của Coolify.

## Bước 2: Deploy Backend

1. Coolify → **Applications** → **+ Add** → **Public**
2. Chọn Git repo `nexgenus`
3. Cấu hình:

   | Field             | Giá trị                        |
   |-------------------|--------------------------------|
   | **Name**          | `sherwoodcare-be`              |
   | **Build Command** | `cd backend && npm install`    |
   | **Start Command** | `cd backend && node server.js` |
   | **Port**          | `3000`                         |

### 2.1 Environment Variables

```
# Database (InternalIP từ Bước 1)
DATABASE_URL=mysql://nexgenus_user:MatKhau@InternalIP:3306/nexgenus

# App
NODE_ENV=production
AUTO_MIGRATE=true
PORT=3000

# CORS — domain frontend thật (điền sau Bước 3)
FRONTEND_URL=https://your-frontend-domain.coolify.app

# Upload — domain backend thật (dùng để tạo link /uploads/...)
BACKEND_URL=https://your-backend-domain.coolify.app

# Optional: absolute path của volume (mặc định backend/public/uploads)
# UPLOAD_DIR=/app/backend/public/uploads

# Gemini AI (chatbot)
GEMINI_API_KEY=AIzaSy...
GEMINI_MODEL=gemini-2.5-flash
```

> **Không cần** `FIREBASE_*`. Upload dùng disk local + Coolify Persistent Volume.

### 2.2 Persistent Volume (quan trọng cho file upload)

Không mount volume → file mất mỗi lần redeploy.

1. Vào service `sherwoodcare-be` → **Storages / Volumes** → **+ Add**
2. Điền:

   | Field              | Giá trị                              |
   |--------------------|--------------------------------------|
   | **Name**           | `uploads`                            |
   | **Source (host)**  | (để Coolify tự quản lý)              |
   | **Destination**    | `/app/backend/public/uploads`        |

   > Path destination phải khớp thư mục backend ghi file.
   > Nếu `Base Directory` / working dir khác, chỉnh `UPLOAD_DIR` env cho khớp.

3. Save → Redeploy.

### 2.3 Deploy

Click **Deploy**. Logs mong đợi:

```
✅ Đã kết nối thành công tới MySQL
📝 Chạy migration: schema.sql
✅ OK: schema.sql
📁 Serving uploads from: /app/backend/public/uploads
Server running on port 3000
```

## Bước 3: Deploy Frontend

1. Coolify → **Applications** → **+ Add** → **Public**
2. Repo `nexgenus`
3. Cấu hình:

   | Field                 | Giá trị                                       |
   |-----------------------|-----------------------------------------------|
   | **Name**              | `sherwoodcare-fe`                             |
   | **Build Command**     | `cd frontend && npm install && npm run build` |
   | **Publish Directory** | `frontend/dist`                               |
   | **Port**              | `80`                                          |

4. Env (build-time, prefix `VITE_`):

   ```
   VITE_API_BASE_URL=https://your-backend-domain.coolify.app
   ```

5. **Deploy** → lấy domain frontend.

## Bước 4: Cập nhật CORS + BACKEND_URL

Sau khi có domain thật của BE + FE:

1. Backend env:

   ```
   FRONTEND_URL=https://sherwoodcare-fe-xxxxx.coolify.app
   BACKEND_URL=https://sherwoodcare-be-xxxxx.coolify.app
   ```

2. Frontend env (rebuild vì Vite bake env lúc build):

   ```
   VITE_API_BASE_URL=https://sherwoodcare-be-xxxxx.coolify.app
   ```

3. Redeploy cả hai service.

## Bước 5: Kiểm tra

### Backend

```bash
curl https://sherwoodcare-be-xxxxx.coolify.app/api/health
# → {"status":"ok",...}

curl https://sherwoodcare-be-xxxxx.coolify.app/api/db/status
# → {"ok":true,"client":"mysql","database":"nexgenus"}
```

### Upload file

```bash
curl -F "file=@./test.pdf" https://sherwoodcare-be-xxxxx.coolify.app/api/upload
# → {"success":true,"data":{"file_url":"https://.../uploads/file-....pdf",...}}

# Mở file_url trên browser → phải tải/xem được
```

### Frontend

- CRUD customer / task / notes
- Upload attachment → URL trỏ về `BACKEND_URL/uploads/...`
- DevTools: không CORS error

### Database

Coolify → Databases → Console:

```sql
SHOW TABLES;
-- 20 bảng: customers, employers, employees, customer_invoices,
-- customer_notes, employee_notes, general_notes, timesheet_periods,
-- timesheet_entries, timesheet_days, timesheetreport, timesheetreport_entries,
-- timesheetreport_days, social_sheets, payroll_nexgenus,
-- payroll_nexgenus_entries, tasks, task_attachments,
-- training_articles, documents
```

## Quản lý Secrets

| Biến                 | Service  | Ghi chú                          |
|----------------------|----------|----------------------------------|
| `DATABASE_URL`       | Backend  | InternalIP MySQL                 |
| `GEMINI_API_KEY`     | Backend  | Chatbot                          |
| `BACKEND_URL`        | Backend  | Domain public BE (link upload)   |
| `FRONTEND_URL`       | Backend  | Domain FE (CORS)                 |
| `UPLOAD_DIR`         | Backend  | Optional, path volume            |
| `VITE_API_BASE_URL`  | Frontend | Domain BE (build-time)           |

**Không dùng** `FIREBASE_*`.

## Troubleshooting

### Backend không kết nối MySQL

- `DATABASE_URL` phải dùng InternalIP Coolify DB, không `127.0.0.1`
- Logs: `ECONNREFUSED` = sai IP; `ER_ACCESS_DENIED` = sai user/password

### CORS

- `FRONTEND_URL` khớp domain FE thật (kể cả `https://`)
- Redeploy backend sau khi sửa env

### Upload 404 / file mất sau redeploy

- Chưa gắn Persistent Volume → mount `/app/backend/public/uploads`
- `BACKEND_URL` sai → link file trỏ domain cũ
- Logs có dòng `📁 Serving uploads from: ...` — path phải trùng volume destination
- Nếu volume mount path khác, set `UPLOAD_DIR` cho khớp

### Migration thiếu bảng

- `AUTO_MIGRATE=true`
- Logs: `📝 Chạy migration: schema.sql` → `✅ OK`
- Redeploy backend để chạy lại

### Frontend gọi API sai host

- `VITE_API_BASE_URL` bake lúc **build** — sửa env rồi **Rebuild** FE, không chỉ restart
