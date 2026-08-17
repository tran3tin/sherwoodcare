# Deploy SherwoodCare lên Coolify

Hướng dẫn deploy toàn bộ dự án (Backend + Frontend + MySQL) lên Coolify
với cấu hình MySQL thay thế hoàn toàn Supabase/Postgres cũ.

## Prerequisites

- [Coolify](https://coolify.io) đã self-hosted hoặc dùng cloud (coolify.io)
- MySQL 8.x server (có thể dùng Coolify "Databases → MySQL" service, hoặc MySQL riêng bên ngoài)
- Repo đã push lên Git (GitHub/GitLab/Gitea). Coolify cần clone được repo.

## Tổng quan kiến trúc

```
┌──────────────┐     ┌───────────────────────────────────┐     ┌──────────────┐
│   Frontend    │────▶│        Coolify                    │────▶│    MySQL     │
│  (React/Vite) │     │  ┌─────────────────────────────┐  │     │   Database   │
│  Static Site  │     │  │  Service: sherwoodcare-fe   │  │     │              │
│               │     │  └─────────────────────────────┘  │     │  nexgenus    │
│               │     │  ┌─────────────────────────────┐  │     │              │
│               │◀────│  │  Service: sherwoodcare-be   │◀─│────│              │
│               │     │  │  (Node.js/Express)          │  │     │              │
└──────────────┘     │  └─────────────────────────────┘  │     └──────────────┘
                     └───────────────────────────────────┘
```

| Service                | Type                   | Port | Tech         |
|------------------------|------------------------|------|--------------|
| `sherwoodcare-fe`      | Public / Static        | 80   | Vite React   |
| `sherwoodcare-be`      | Public / Node.js       | 3000 | Express API  |
| `nexgenus-db`          | Private / Database     | 3306 | MySQL 8.x    |

## Bước 1: Tạo MySQL Database

### Cách A: Dùng Coolify "Databases"

1. Coolify Dashboard → **Databases** → **+ Add new** → **MySQL**
2. Điền:
   - **Name**: `nexgenus-db`
   - **Default Database**: `nexgenus`
   - **Username**: `nexgenus_user` (hoặc tùy chọn)
   - **Password**: (tự sinh hoặc tự điền)
   - **Port**: `3306`
3. Click **Create database**. Coolify tự cài MySQL và tạo DB.
4. Sau khi tạo xong, vào trang database vừa tạo → copy **Connection URL**:

   ```
   mysql://nexgenus_user:MatKhau@InternalIP:3306/nexgenus
   ```

   `InternalIP` là địa chỉ nội bộ của Coolify (VD: `172.19.0.2`), **KHÔNG** phải `127.0.0.1`.

### Cách B: Dùng MySQL riêng (bên ngoài Coolify)

- MySQL server phải cho phép kết nối từ mạng Docker của Coolify.
- Lấy connection string dạng:

  ```
  mysql://user:password@host:3306/nexgenus
  ```

## Bước 2: Deploy Backend

1. Coolify Dashboard → **Applications** → **+ Add new resource** → **Public**
2. Chọn **Git Repository**, kết nối và chọn repo `nexgenus`
3. Điền cấu hình:

   | Field               | Giá trị                                |
   |---------------------|----------------------------------------|
   | **Name**            | `sherwoodcare-be`                      |
   | **Build Command**   | `cd backend && npm install`            |
   | **Start Command**   | `cd backend && node server.js`         |
   | **Port**            | `3000`                                 |
   | **Source Directory**| `backend` *(chỉ cần nếu repo gốc không tự nhận)* |

4. Click **Advanced** → **Environment Variables** → thêm các biến sau:

   ### Database
   ```
   DATABASE_URL=mysql://nexgenus_user:MatKhau@InternalIP:3306/nexgenus
   ```
   *(Thay bằng connection URL thật từ Coolify ở Bước 1)*

   ### Gemini AI (Chatbot)
   ```
   GEMINI_API_KEY=AIzaSy... (key thật của bạn)
   GEMINI_MODEL=gemini-2.5-flash
   ```

   ### Firebase Storage (upload file)
   ```
   FIREBASE_PROJECT_ID=sherwoodcare-d3de5
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@sherwoodcare-d3de5.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...full key...\n-----END PRIVATE KEY-----\n"
   ```
   *(Private key copy từ Firebase Console → Service Accounts → Generate New Private Key)*

   ### App
   ```
   NODE_ENV=production
   AUTO_MIGRATE=true
   FRONTEND_URL=https://your-frontend-domain.coolify.app
   PORT=3000
   ```

   > **Lưu ý**: `DATABASE_URL` dùng `InternalIP` của Coolify database service, KHÔNG dùng `127.0.0.1` hay `localhost`.

5. Click **Deploy**.

   - Coolify tự chạy `npm install` rồi `node server.js`
   - Lần đầu khởi động, backend tự chạy migration (`AUTO_MIGRATE=true`) tạo toàn bộ 20 bảng
   - Xem logs trong Coolify: `npm install` → `Database migrations finished.` → `Server running on port 3000`
   - Nếu có lỗi kết nối DB → kiểm tra lại `DATABASE_URL` InternalIP đúng chưa

## Bước 3: Deploy Frontend

1. Coolify Dashboard → **Applications** → **+ Add new resource** → **Public**
2. Chọn **Git Repository**, kết nối repo `nexgenus`
3. Điền cấu hình:

   | Field               | Giá trị                              |
   |---------------------|--------------------------------------|
   | **Name**            | `sherwoodcare-fe`                    |
   | **Build Command**   | `cd frontend && npm install && npm run build` |
   | **Publish Directory**| `frontend/dist`                     |
   | **Port**            | `80` (Coolify tự serve static)       |

4. **Environment Variables** — các biến Vite cần bắt đầu bằng `VITE_` để frontend đọc được:

   ```
   VITE_API_BASE_URL=https://your-backend-domain.coolify.app
   ```

   > `VITE_API_BASE_URL` là URL backend Coolify tạo ra (VD: `https://sherwoodcare-be-xxxxx.coolify.app`).
   > Frontend dùng biến này làm `baseURL` cho tất cả API calls.

   *(Nếu cần Firebase client-side config, thêm các biến `VITE_FIREBASE_*` tương ứng trong `frontend/src/config/firebase.js`)*

5. Click **Deploy**.

   - Coolify chạy `npm install` → `npm run build` → tạo `frontend/dist/`
   - Coolify serve thư mục `dist/` qua port 80
   - Lấy domain từ Coolify (VD: `https://sherwoodcare-fe-xxxxx.coolify.app`)

## Bước 4: Cập nhật CORS

Sau khi cả 2 service đã deploy và có domain thật:

1. Vào service **Backend** (`sherwoodcare-be`) → **Environment Variables**
2. Cập nhật:

   ```
   FRONTEND_URL=https://sherwoodcare-fe-xxxxx.coolify.app
   ```

3. Redeploy backend (hoặc restart service).

Backend sẽ cho phép CORS requests từ domain frontend thật.

## Bước 5: Kiểm tra

### Kiểm tra Backend

```
curl https://sherwoodcare-be-xxxxx.coolify.app/api/health
# → {"status":"ok",...}

curl https://sherwoodcare-be-xxxxx.coolify.app/api/db/status
# → {"ok":true,"client":"mysql","database":"nexgenus"}
```

### Kiểm tra Frontend

- Mở domain frontend trong browser
- Thao tác CRUD: tạo customer, tạo task, upload file, xem notes → đều phải qua API backend
- Mở DevTools → Console → không có CORS error

### Kiểm tra Database

Vào Coolify → Databases → `nexgenus-db` → **Console** → chạy:

```sql
SHOW TABLES;
-- Phải thấy 20 bảng: customers, employers, employees, customer_invoices,
-- customer_notes, employee_notes, general_notes, timesheet_periods,
-- timesheet_entries, timesheet_days, timesheetreport, timesheetreport_entries,
-- timesheetreport_days, social_sheets, payroll_nexgenus,
-- payroll_nexgenus_entries, tasks, task_attachments,
-- training_articles, documents
```

## Quản lý Secrets

Coolify lưu environment variables an toàn — không cần commit `.env` lên git.

| Secret           | Nơi cấu hình                    |
|------------------|--------------------------------|
| `DATABASE_URL`   | Backend env vars               |
| `GEMINI_API_KEY` | Backend env vars               |
| `FIREBASE_PRIVATE_KEY` | Backend env vars (dài)  |
| `VITE_API_BASE_URL` | Frontend env vars           |

## Troubleshooting

### Backend không kết nối được MySQL

- Kiểm tra `DATABASE_URL` có dùng `InternalIP` của Coolify database service (không phải `127.0.0.1`)
- Xem logs: Coolify → `sherwoodcare-be` → **Logs**
- Lỗi thường gặp: `ECONNREFUSED` → sai IP, `ER_ACCESS_DENIED` → sai user/password

### Frontend gọi API bị lỗi CORS

- Kiểm tra `FRONTEND_URL` trong backend env vars trùng khớp domain frontend thật
- Redeploy backend sau khi sửa env var

### Migration chưa chạy đủ bảng

- `AUTO_MIGRATE=true` phải có trong backend env vars
- Xem logs có dòng `📝 Chạy migration: schema.sql` → `✅ OK: schema.sql`
- Nếu cần chạy lại: Coolify → `sherwoodcare-be` → **Redeploy**

### Upload file lỗi Firebase

- Kiểm tra 3 biến Firebase (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`) đã set đúng
- Private key phải giữ nguyên format `\n` (newline escaped) — copy từ `.env` file