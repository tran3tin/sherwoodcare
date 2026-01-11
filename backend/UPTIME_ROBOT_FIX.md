# Hướng dẫn fix lỗi 404 Uptime Robot

## Vấn đề

Uptime Robot truy cập vào `https://sherwoodcare.onrender.com/` trả về lỗi 404 vì backend chưa định nghĩa route cho trang chủ (`/`).

## Giải pháp đã áp dụng

Đã thêm 2 endpoints vào `server.js`:

### 1. Root endpoint (`/`)

```javascript
app.get("/", (req, res) => {
  res.status(200).json({
    message: "SherwoodCare Backend API is running!",
    status: "ok",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/api/health",
      ping: "/ping",
    },
  });
});
```

**Response khi truy cập `https://sherwoodcare.onrender.com/`:**

```json
{
  "message": "SherwoodCare Backend API is running!",
  "status": "ok",
  "timestamp": "2026-01-11T10:30:00.000Z",
  "endpoints": {
    "health": "/api/health",
    "ping": "/ping"
  }
}
```

### 2. Ping endpoint (`/ping`)

```javascript
app.get("/ping", (req, res) => {
  res.status(200).send("Pong!");
});
```

**Response khi truy cập `https://sherwoodcare.onrender.com/ping`:**

```
Pong!
```

## Cách cấu hình Uptime Robot

Sau khi deploy code mới lên Render, cấu hình Uptime Robot như sau:

### Option 1: Monitor root endpoint (/)

- **Monitor Type**: HTTP(s)
- **URL**: `https://sherwoodcare.onrender.com/`
- **Monitoring Interval**: 5 minutes
- **Expected Status Code**: 200

### Option 2: Monitor /ping endpoint (đơn giản hơn)

- **Monitor Type**: HTTP(s)
- **URL**: `https://sherwoodcare.onrender.com/ping`
- **Monitoring Interval**: 5 minutes
- **Expected Status Code**: 200

### Option 3: Monitor /api/health endpoint (chi tiết nhất)

- **Monitor Type**: HTTP(s)
- **URL**: `https://sherwoodcare.onrender.com/api/health`
- **Monitoring Interval**: 5 minutes
- **Expected Status Code**: 200

## Kiểm tra local

```bash
# Test root endpoint
curl http://localhost:3000/

# Test ping endpoint
curl http://localhost:3000/ping

# Test health endpoint
curl http://localhost:3000/api/health
```

## Deploy lên Render

1. Commit và push code lên Git:

```bash
git add backend/server.js
git commit -m "Add root and ping endpoints for Uptime Robot monitoring"
git push origin main
```

2. Render sẽ tự động deploy

3. Sau khi deploy xong, test trên production:

```bash
curl https://sherwoodcare.onrender.com/
curl https://sherwoodcare.onrender.com/ping
curl https://sherwoodcare.onrender.com/api/health
```

4. Cập nhật Uptime Robot với URL mới

## Lưu ý

- Lỗi 404 sẽ biến mất sau khi deploy code mới
- Uptime Robot sẽ nhận được status code 200 thay vì 404
- Backend sẽ không bị Render sleep do có traffic thường xuyên từ Uptime Robot
