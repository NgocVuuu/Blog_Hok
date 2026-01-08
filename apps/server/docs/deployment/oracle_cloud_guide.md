# Hướng dẫn Deploy trên Oracle Cloud Always Free (Cho 10+ dự án)

Tài liệu này hướng dẫn bạn cách thiết lập một VPS miễn phí "vĩnh viễn" cực mạnh của Oracle Cloud để chạy Node.js, Puppeteer và hosting hơn 10 website dự án khác.

## 1. Tại sao lại là Oracle Cloud?
Gói "Always Free" của Oracle cung cấp tài nguyên vượt trội so với tất cả các bên khác:
- **CPU**: 4 OCPU (ARM Ampere A1) - tương đương 8 vCPU thường.
- **RAM**: 24 GB (Rất lớn, thoải mái chạy Docker, Database).
- **Disk**: 200 GB.
- **Support**: Chạy tốt Ubuntu, Docker.

## 2. Các bước Chuẩn bị & Đăng ký
1. **Chuẩn bị thẻ Visa/Mastercard**: Trong thẻ cần có khoảng $1-2 để xác minh (sẽ hoàn lại).
2. **Đăng ký**: Tại [Oracle Cloud Free Tier](https://signup.cloud.oracle.com/).
3. **Chọn Home Region**:
   - **Rất quan trọng**: Chọn **Singapore** hoặc **Tokyo** để có tốc độ về Việt Nam nhanh nhất.
   - *Lưu ý*: Nếu region đó hết tài nguyên (Out of capacity), có thể phải thử lại sau hoặc chọn region khác (US West), nhưng sẽ chậm hơn.

## 3. Tạo VPS (Compute Instance)
Sau khi tài khoản được duyệt (có thể mất vài giờ đến 1 ngày):
1. Vào Menu -> **Compute** -> **Instances** -> **Create Instance**.
2. **Image & Shape** (Quan trọng nhất):
   - Bấm **Change Image**: Chọn **Ubuntu** (bản 22.04 hoặc 24.04).
   - Bấm **Change Shape**:
     - Chọn **Ampere** (VM.Standard.A1.Flex).
     - Kéo thanh trượt lên tối đa: **4 OCPU** và **24 GB RAM**.
3. **Networking**: Để mặc định (Create new VCN).
4. **SSH Keys**:
   - Chọn "Generate a key pair for me".
   - **BẮT BUỘC**: Bấm **Save Private Key** để tải file `.key` về máy. Mất file này là mất quyền truy cập server.
5. Bấm **Create**.

## 4. Mở Port (Cấu hình Firewall)
Oracle Cloud có 2 lớp tường lửa. Bạn cần mở cả 2.

### Lớp 1: Trên trang quản trị Oracle (Security List)
1. Bấm vào tên Instance vừa tạo -> Bấm vào link **Subnet** (ví dụ: `subnet-xxxx`).
2. Bấm vào **Default Security List**.
3. Bấm **Add Ingress Rules**:
   - Source CIDR: `0.0.0.0/0`
   - IP Protocol: `TCP`
   - Destination Port Range: `80,443,22,8000,3000-5000` (Mở rộng cho nhiều dự án).
   - Description: `Web Ports`.

### Lớp 2: Trên VPS (Ubuntu IPTables)
1. Kết nối SSH vào server:
   ```bash
   ssh -i duong/dan/toi/file.key ubuntu@<IP-Address>
   ```
2. Chạy các lệnh sau để mở port trên Ubuntu (Oracle chặn port mặc định rất gắt):
   ```bash
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
   sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8000 -j ACCEPT
   sudo netfilter-persistent save
   ```
   *Lưu ý*: Nếu lệnh `netfilter-persistent` lỗi, hãy chạy `sudo apt install iptables-persistent` trước.

## 5. Cài đặt Coolify (Giải pháp quản lý 10+ dự án)
Thay vì cài tay Nginx/Node cho từng dự án, ta dùng **Coolify** (mã nguồn mở, giống Vercel self-hosted). Nó giúp bạn deploy 10 dự án chỉ bằng vài cú click.

1. Chạy lệnh cài đặt (với quyền root):
   ```bash
   sudo -i
   curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
   ```
2. Đợi khoảng 5-10 phút. Khi xong nó sẽ hiện: `Coolify is ready at http://<IP>:8000`.
3. Truy cập `http://<IP-Cua-Ban>:8000` để tạo tài khoản admin.

## 6. Deploy Dự án BlogHok (Node.js + Puppeteer)
Vì VPS dùng chip ARM (Ampere), việc chạy Puppeteer cần lưu ý nhỏ.

### Cách 1: Deploy qua Coolify (Khuyên dùng)
1. Trong Coolify, tạo **Project** -> **New Resource** -> **Application** -> **Public Repository**.
2. Điền link Github của bạn: `https://github.com/NgocVuuu/BlogHok` (Hoặc repo chứa backend).
3. **Build Pack**: Chọn `Nixpacks` (Coolify mặc định dùng cái này, rất mạnh).
4. **Environment Variables**: Điền `.env` của bạn vào.
5. **Config cho Puppeteer**: 
   - Trong phần cấu hình Nixpacks của Coolify, thêm `chromium` vào danh sách packages.
   - Code của bạn cần dùng `puppeteer-core` hoặc trỏ `executablePath` đúng cách (thường Nixpacks xử lý tự động khá tốt, nhưng nếu lỗi hãy check log).

### Cách 2: Setup Docker thủ công (Nếu không thích Coolify)
Tạo file `Dockerfile` trong `apps/server`:
```dockerfile
FROM node:18-bullseye

# Cài Chromium cho ARM
RUN apt-get update && apt-get install -y chromium

# Thiết lập biến môi trường để Puppeteer dùng Chromium cài sẵn
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

CMD ["npm", "start"]
```
Build và chạy:
```bash
docker build -t bloghok-server .
docker run -d -p 7000:7000 --env-file .env bloghok-server
```

## Tổng kết
Với setup này:
- Bạn có một server cực mạnh, miễn phí vĩnh viễn.
- **Coolify** giúp bạn quản lý cả 10 dự án dễ dàng, tự động SSL (HTTPS), tự động deploy khi push code lên Github.
- Database: Bạn có thể tiếp tục dùng Mongo Atlas hoặc cài MongoDB ngay trên VPS này (Coolify hỗ trợ 1 click cài Mongo) để tiết kiệm thời gian network.
