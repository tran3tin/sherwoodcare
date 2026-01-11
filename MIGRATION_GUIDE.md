# Migration Guide for Customer Table Updates

## Vấn đề
Database production chưa có các cột mới: `first_name`, `last_name`, `reference`, `room`, `payment_method_1`, `payment_method_2`, `note`

## Giải pháp

### Cách 1: Chạy migration tự động (Khuyến nghị)

Khi deploy, hệ thống sẽ tự động chạy migration nếu `AUTO_MIGRATE=true` trong environment variables.

Kiểm tra logs khi khởi động server để đảm bảo migration đã chạy:
```
🔄 AUTO_MIGRATE enabled, đang tạo database...
📝 Chạy migration: 00_init_all_tables.sql
✅ Khởi tạo bảng thành công!
📝 Chạy migration: 01_alter_customers_add_new_fields.sql
✅ Cập nhật các trường mới thành công!
```

### Cách 2: Chạy migration thủ công trên Render

1. Vào Render Dashboard → Your Service → Shell
2. Chạy lệnh:
```bash
npm run migrate-customers
```

### Cách 3: Chạy SQL trực tiếp trên Supabase

1. Vào Supabase Dashboard → SQL Editor
2. Copy nội dung file `backend/migrations/01_alter_customers_add_new_fields.sql`
3. Paste và Execute

### Cách 4: Chạy từ local (nếu có VPN/access đến production DB)

```bash
cd backend
node scripts/migrate-customers.js
```

## Kiểm tra sau khi migrate

Chạy query này để kiểm tra các cột đã được tạo:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;
```

## Lưu ý

- Migration sử dụng `IF NOT EXISTS` nên an toàn khi chạy nhiều lần
- Dữ liệu cũ sẽ được giữ nguyên
- Script tự động tách `full_name` thành `first_name` và `last_name` cho dữ liệu cũ
