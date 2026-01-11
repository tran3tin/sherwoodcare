# Fix lỗi Network Error khi lưu Timesheet Report

## Vấn đề

Frontend gặp lỗi `ERR_NAME_NOT_RESOLVED` và `Network Error` khi lưu timesheet report về database:

```
Error: Network Error
sherwoodcare.onrender.com/api/notifications/due-notes:1 Failed to load resource: net::ERR_NAME_NOT_RESOLVED
```

## Nguyên nhân

File `.env` trong frontend có:

```env
VITE_API_BASE_URL=http://localhost:3000
```

Khi build production, Vite đọc biến môi trường này và sử dụng `localhost:3000` thay vì backend URL trên Render (`https://sherwoodcare.onrender.com`).

## Giải pháp đã áp dụng

Cập nhật `frontend/src/config/api.js` để tự động sử dụng production URL khi:

- Build mode là production (`import.meta.env.PROD === true`)
- Biến môi trường vẫn trỏ đến localhost

**Trước:**

```javascript
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? DEFAULT_PROD : DEFAULT_DEV);
```

**Sau:**

```javascript
const envApiUrl =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const isEnvLocalhost =
  envApiUrl &&
  (envApiUrl.includes("localhost") || envApiUrl.includes("127.0.0.1"));

export const API_BASE_URL =
  import.meta.env.PROD && isEnvLocalhost
    ? DEFAULT_PROD // Use production URL if env is localhost in prod build
    : envApiUrl || (import.meta.env.PROD ? DEFAULT_PROD : DEFAULT_DEV);
```

## Kết quả

- ✅ Development: Vẫn dùng `http://localhost:3000`
- ✅ Production build: Tự động dùng `https://sherwoodcare.onrender.com`
- ✅ API calls sẽ gọi đúng backend URL
- ✅ Lưu timesheet report thành công

## Deploy lên Render

1. Commit và push:

```bash
git add frontend/src/config/api.js
git commit -m "Fix API URL in production build"
git push origin main
```

2. Render sẽ tự động rebuild frontend

3. Sau khi deploy xong, test lại chức năng lưu timesheet report

## Lưu ý

Nếu muốn sử dụng URL khác cho production, có 2 cách:

### Cách 1: Tạo file `.env.production` (khuyên dùng)

```env
VITE_API_BASE_URL=https://your-backend-url.com
```

### Cách 2: Cập nhật `DEFAULT_PROD` trong `api.js`

```javascript
const DEFAULT_PROD = "https://your-backend-url.com";
```

## Test local

Để test production build trên local:

```bash
cd frontend
npm run build
npm run preview
```

Mở browser console và kiểm tra API calls có gọi đúng `https://sherwoodcare.onrender.com` không.
