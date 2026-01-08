# Hướng dẫn Deploy trên DigitalOcean (Dùng GitHub Student Pack)

Chúc mừng bạn! Với **GitHub Student Developer Pack**, bạn có **$200 credit** để dùng DigitalOcean trong 12 tháng. Số tiền này dư sức nuôi một VPS mạnh để chạy 10 dự án + Crawler.

## 1. Chọn Cấu Hình Droplet (VPS)
Với $200 (tương đương ~$16.6/tháng), bạn nên chọn cấu hình "ngon" nhất trong tầm giá này để máy chạy mượt:

1.  **Region**: Chọn **Singapore** (cho tốc độ về VN nhanh nhất).
2.  **OS**: Chọn **Ubuntu 24.04 (LTS)**.
3.  **Droplet Type**:
    *   Chọn **Basic** -> **Regular** (Intel with SSD).
    *   Cấu hình: **2 VCPU - 2 GB RAM - 50GB SSD**.
    *   Giá: **$12/tháng**.
    *   *(Gói này vẫn dư tiền để dùng cả năm, lại có 2 Core giúp chạy nhiều tác vụ song song tốt hơn gói 1 Core).*

## 2. Tạo VPS
1.  **Authentication**: Chọn **SSH Key** (Tạo mới và lưu file key, giống hệt lúc làm Oracle). Hoặc chọn **Password** nếu bạn thấy SSH Key quá phức tạp (nhưng SSH Key bảo mật hơn).
2.  **Hostname**: Đặt tên dễ nhớ, ví dụ `bloghok-vps`.
3.  Bấm **Create Droplet**.

## 3. Cài đặt Coolify (Quản lý 10 dự án)
DigitalOcean dễ tính hơn Oracle nhiều, không chặn port lung tung, nên cài cực nhanh.

1.  Mở Console của DigitalOcean (hoặc dùng SSH trên máy bạn):
    ```bash
    ssh root@<IP-Cua-Ban>
    ```
2.  Chạy lệnh cài Coolify:
    ```bash
    curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
    ```
3.  Đợi khoảng 5 phút. Khi xong truy cập: `http://<IP-Cua-Ban>:8000`.

## 4. Deploy Backend BlogHok
Vì code đã có sẵn `Dockerfile` (mình đã tối ưu ở bước trước), nên việc deploy là tự động hoàn toàn.

1.  Trong Coolify: **+ New Resource** -> **Application** -> **Public Repository**.
2.  Điền URL: `https://github.com/NgocVuuu/BlogHok` (nhớ trỏ vào đúng repo).
3.  **Build Pack**: Chọn **Docker** (Coolify sẽ tự nhận diện file Dockerfile trong `apps/server`).
4.  **Base Directory**: Điền `/apps/server` (Vì code backend nằm trong thư mục con này). ⚠️ *Quan trọng*.
5.  **Environment Variables**: Copy nội dung `.env` vào tab Environment.
6.  **Port Mapping**: Mặc định Dockerfile mình set port `7000`. Trong Coolify hãy map External Port (ví dụ 80 hoặc 443) -> Internal Port `7000`.

## 5. Lưu ý cho Puppeteer
2 GB RAM là đủ để chạy Puppeteer, nhưng nếu chạy nhiều tab quá có thể bị tràn RAM.
*   Mình đã tối ưu Dockerfile để dùng `chromium` hệ thống, nhẹ hơn bản Chrome gốc.
*   Nếu thấy server hay bị đơ, hãy bật **Swap Memory** (RAM ảo) trên Coolify -> Server Settings (Coolify thường tự bật sẵn 4GB swap cho bạn, rất an toàn).

## Tổng kết
Đây là phương án **tốt nhất** cho bạn lúc này:
*   ✅ **Mạnh**: 2 CPU, 2 GB RAM là cấu hình chuẩn cho Production nhỏ.
*   ✅ **Rẻ**: Free (nhờ $200 credit).
*   ✅ **Bền**: DigitalOcean rất uy tín, không khóa acc vô cớ.
