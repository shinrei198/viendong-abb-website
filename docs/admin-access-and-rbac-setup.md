# Thiết lập Cloudflare Access và phân quyền quản trị

## Kiến trúc đã chọn

- **Cloudflare Access** xác minh danh tính bằng email/OTP hoặc nhà cung cấp đăng nhập.
- **D1 `admin_users`** quyết định tài khoản có được dùng trang quản trị và giữ vai trò nào.
- **Worker** kiểm tra quyền cho từng request ghi dữ liệu. Việc ẩn nút trên giao diện không được xem là bảo mật.
- Website không lưu mật khẩu.
- Tài khoản được vô hiệu hóa thay vì xóa vật lý để giữ lịch sử kiểm toán.

## Vai trò

### Admin

- Toàn quyền nội dung, sản phẩm, báo giá và cài đặt.
- Tạo tài khoản Admin, Content và Business.
- Đổi vai trò, vô hiệu hóa và kích hoạt lại tài khoản.
- Không thể tự hạ quyền/vô hiệu hóa chính mình.
- Hệ thống luôn giữ ít nhất một Admin hoạt động.

### Content

- Quản lý trang chủ và banner.
- Quản lý nội dung trang Giới thiệu.
- Quản lý tin tức, nhóm tin tức, video và nhóm video.
- Upload media nội dung.

### Business

- Quản lý sản phẩm, dòng, loại, biến thể, màu sắc và trạng thái tồn kho.
- Xem yêu cầu báo giá và cập nhật trạng thái xử lý.
- Không được xóa hoặc import hàng loạt báo giá.

## Bước cấu hình bắt buộc trước khi deploy

### 1. Chạy migration D1

Kiểm tra trước ở local/staging, sau đó mới chạy production:

```powershell
npx.cmd wrangler d1 migrations apply viendong-quotes --local
npx.cmd wrangler d1 migrations apply viendong-quotes --remote
```

Migration mới: `migrations/0003_admin_rbac.sql`.

### 2. Tạo Access application chỉ cho `/admin*`

Trong Cloudflare Zero Trust:

1. Access controls → Applications → Add self-hosted application.
2. Domain/path: hostname production kèm `/admin*`.
3. Chọn phương thức xác minh email/OTP hoặc IdP phù hợp.
4. Vì quyền ứng dụng được kiểm tra lại trong D1, policy Access có thể cho phép người có danh tính email hợp lệ đi tới lớp xác minh ứng dụng. Nếu công ty có domain email riêng, nên giới hạn theo domain.
5. Đặt session duration ngắn, ví dụ 8 giờ; yêu cầu đăng nhập lại cho thiết bị mới.

Không bảo vệ toàn bộ Worker vì storefront và endpoint gửi báo giá phải tiếp tục công khai.

### 3. Khai báo biến môi trường Worker

- `ACCESS_TEAM_DOMAIN`: ví dụ `https://ten-team.cloudflareaccess.com`
- `ACCESS_AUD`: Application Audience của Access application
- `BOOTSTRAP_ADMIN_EMAIL`: email Admin đầu tiên

Không commit giá trị thực vào repository. Cấu hình chúng trong Worker Settings/Variables hoặc bằng secrets.

### 4. Khởi tạo Admin đầu tiên

Sau khi migration và biến môi trường đã sẵn sàng:

1. Đăng nhập Cloudflare Access bằng đúng `BOOTSTRAP_ADMIN_EMAIL`.
2. Mở `/admin`.
3. Khi bảng `admin_users` đang trống, Worker tự tạo duy nhất email này với vai trò Admin.
4. Dùng tab “Tài khoản & Phân quyền” để thêm các tài khoản tiếp theo.

## Ma trận bảo vệ API

| API | Công khai | Content | Business | Admin |
| --- | --- | --- | --- | --- |
| `GET /api/content` | Có | Có | Có | Có |
| `POST /api/quotes` | Có | Có | Có | Có |
| Ghi homepage/banner | Không | Có | Không | Có |
| Ghi news/video | Không | Có | Không | Có |
| Ghi products | Không | Không | Có | Có |
| Xem báo giá | Không | Không | Có | Có |
| Đổi trạng thái báo giá | Không | Không | Có | Có |
| Xóa/import báo giá | Không | Không | Không | Có |
| Quản lý settings | Không | Không | Không | Có |
| Quản lý tài khoản | Không | Không | Không | Có |

## Kiểm thử bắt buộc trước production

- Request quản trị không có Access token phải nhận `401` hoặc `503` khi chưa cấu hình.
- Content không thể sửa sản phẩm hoặc đọc báo giá.
- Business không thể sửa tin tức, xóa báo giá hay quản lý tài khoản.
- Admin không thể vô hiệu hóa chính mình hoặc Admin cuối cùng.
- Public vẫn đọc nội dung và gửi báo giá bình thường.
- Audit log ghi lại thay đổi tài khoản, CMS, báo giá và upload media.

## Kiểm thử Cloudflare Access ở local

Wrangler hỗ trợ mô phỏng `ctx.access` bằng khối `access.dev` trong `wrangler.json`.
Danh tính local là `local-admin@viendong.test` và chỉ được dùng bởi `wrangler dev`; cấu hình
này không tạo người dùng hoặc cơ chế bỏ qua xác thực trên production.

```powershell
npm.cmd run dev:worker
```

Sau khi Worker local khởi động, mở URL mà Wrangler hiển thị và truy cập `/admin`.
Luồng này kiểm thử Worker, D1 local, session, ma trận quyền và giao diện quản trị. Nó không
thay thế lượt staging dùng OTP/SSO thật tại Cloudflare Edge.

Để kiểm thử trạng thái không xác thực, tạm bỏ khối `access.dev`, khởi động lại Wrangler và
xác nhận `/api/auth/session` cùng các API ghi dữ liệu bị từ chối.

## Phân phối mã quản trị

Các chunk chứa `AdminRoute`, `AdminPage` và công cụ quản trị được build vào `/admin-assets/*`,
tách khỏi bundle công khai. Access application phải bảo vệ `/admin*`; pattern này bao phủ cả
`/admin` và `/admin-assets/*`. Người dùng công khai không tải các chunk này trong quá trình
duyệt storefront, và sau khi cấu hình Access họ cũng không thể tải trực tiếp khi chưa xác thực.
