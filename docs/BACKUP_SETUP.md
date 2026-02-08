# ☁️ Hướng dẫn cài đặt Backup tự động lên OneDrive

Hướng dẫn này sẽ giúp bạn thiết lập tính năng tự động sao lưu dữ liệu từ MongoDB Atlas về tài khoản OneDrive 5TB của bạn mỗi tuần.

## Bước 1: Cài đặt Rclone
Rclone là công cụ giúp kết nối và đồng bộ dữ liệu với các dịch vụ đám mây.

Mở terminal (nhấn `Ctrl + J` trong VS Code) và chạy lệnh sau:
```powershell
winget install Rclone.Rclone
```
*Sau khi cài xong, bạn cần tắt và mở lại Terminal để lệnh `rclone` có hiệu lực.*

---

## Bước 2: Cấu hình kết nối OneDrive
Sau khi khởi động lại terminal, hãy chạy lệnh:
```powershell
rclone config
```

Làm theo các bước sau (nhập ký tự tương ứng và nhấn Enter):

1. **No remotes found, make a new one?**: Nhập `n` (New remote).
2. **name**: Nhập `onedrive`.
3. **Storage**: Tìm số tương ứng với **"Microsoft OneDrive"** (thường là khoảng số 30-35) và nhập số đó vào.
4. **client_id**: Để trống (Enter).
5. **client_secret**: Để trống (Enter).
6. **Edit advanced config?**: Nhập `n`.
7. **Use web browser to automatically authenticate?**: Nhập `y`.
   - *Trình duyệt web sẽ mở ra, hãy đăng nhập vào tài khoản OneDrive 5TB của bạn và chấp nhận quyền truy cập.*
8. **Type of connection**: Chọn `1` (OneDrive Personal or Business).
9. **Found 1 drives...**: Nếu nó hiện danh sách, chọn `1` (hoặc ổ nào bạn muốn dùng).
10. **Is that okay?**: Nhập `y`.
11. **Keep this "onedrive" remote?**: Nhập `y`.
12. **Quit config**: Nhập `q`.

---

## Bước 3: Lấy chuỗi cấu hình (Secrets)
Bây giờ bạn cần lấy đoạn mã cấu hình để dán vào GitHub. Chạy lệnh:

```powershell
rclone config show
```

Bạn sẽ thấy một đoạn văn bản giống như thế này:

```ini
[onedrive]
type = onedrive
token = {"access_token":"...","token_type":"Bearer",...}
drive_id = b!.......
drive_type = business
```

👉 **Hãy copy toàn bộ đoạn này (bao gồm cả dòng `[onedrive]`).**

---

## Bước 4: Thêm vào GitHub Secrets
1. Truy cập trang GitHub repository của dự án này.
2. Vào tab **Settings** ⚙️.
3. Ở menu bên trái, chọn **Secrets and variables** > **Actions**.
4. Nhấn nút **New repository secret**.
5. Điền thông tin:
   - **Name**: `RCLONE_CONFIG`
   - **Secret**: Dán đoạn mã config bạn vừa copy ở Bước 3 vào đây.
6. Nhấn **Add secret**.

✅ **Hoàn tất!** Hệ thống sẽ tự động backup vào 5:00 sáng Thứ 6 hàng tuần.
