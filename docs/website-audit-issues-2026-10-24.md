# Danh sách issues sau lượt rà soát website

Ngày rà soát: 2026-10-24
Phạm vi: mã nguồn React/Vite, Cloudflare Worker, CMS, quy trình build và cấu trúc tính năng.
Trạng thái tài liệu: backlog ban đầu để thống nhất giải pháp; chưa phải kế hoạch triển khai đã duyệt.

## Quy ước mức độ

- **P0 — Khẩn cấp:** có thể ảnh hưởng bảo mật hoặc dữ liệu; cần xác minh và xử lý trước các cải tiến khác.
- **P1 — Cao:** ảnh hưởng độ tin cậy, phát hành, hiệu năng hoặc SEO.
- **P2 — Trung bình:** tính năng chưa hoàn thiện hoặc tạo trải nghiệm không rõ ràng.
- **P3 — Nợ kỹ thuật:** chưa gây lỗi trực tiếp nhưng làm tăng chi phí bảo trì và nguy cơ phát sinh lỗi.

## Danh sách tổng hợp

| Mã | Mức độ | Issue | Trạng thái |
| --- | --- | --- | --- |
| SEC-001 | P0 | Admin và các API quản trị chưa có xác thực ở tầng ứng dụng | Đã triển khai code RBAC; chờ cấu hình Access, migration và kiểm thử staging |
| QA-001 | P1 | TypeScript không vượt qua kiểm tra kiểu dữ liệu | Đã sửa; type-check đạt |
| QA-002 | P1 | Quy trình build không chạy type-check, test hoặc lint | Đã thêm `typecheck` và `check`; test/lint còn trong backlog |
| PERF-001 | P1 | Bundle JavaScript chính quá lớn và chưa code-splitting | Đã code-splitting; cần đo tải thực tế |
| ROUTE-001 | P1 | URL không tồn tại bị đưa về trang chủ thay vì trang 404 | Đã thêm NotFoundPage; cần kiểm thử trực quan |
| CMS-001 | P1 | Lỗi tải CMS bị im lặng và tự dùng dữ liệu seed/localStorage | Đã xác nhận |
| SEO-001 | P1 | SEO bài viết có thể được tính trước khi dữ liệu Cloudflare tải xong | Đã xác nhận theo luồng hiện tại |
| FEATURE-001 | P2 | Trang bản đồ/hệ thống phân phối đang bị vô hiệu hóa | Đã giữ source, ẩn route công khai và không hiển thị shortcut |
| FEATURE-002 | P2 | Ô đăng ký nhận tin ở Footer chưa hoạt động | Đã xác nhận |
| ARCH-001 | P3 | Một số component quá lớn, đặc biệt là AdminPage | Đã xác nhận |
| TOOL-001 | P3 | `vite.config.ts` dùng các cách viết sắp không tương thích config loader mới | Đã xác nhận qua cảnh báo build |
| OPS-001 | P2 | Worktree có thay đổi và tài nguyên chưa được phân loại trước lần phát hành tiếp theo | Đã xác nhận; không tự ý sửa/xóa |
| UX-001 | P2 | Chưa hoàn tất kiểm thử trực quan desktop/mobile trong lượt quét này | Cần kiểm tra tiếp |

## Chi tiết và hướng giải pháp ban đầu

### SEC-001 — Bảo vệ Admin và API quản trị

**Bằng chứng**

- `/admin` là route công khai trong `src/App.tsx` và có thể mở từ Header.
- `src/worker.ts` xử lý trực tiếp các API `/api/content`, `/api/quotes`, `/api/media` và `/api/site-data` mà không thấy bước xác thực/phân quyền.
- Các thao tác nhạy cảm gồm đọc toàn bộ yêu cầu báo giá, import báo giá, đổi trạng thái, xóa báo giá, cập nhật CMS và tải media.

**Rủi ro**

- Người không được phép có thể đọc dữ liệu khách hàng hoặc thay đổi dữ liệu quản trị nếu production không được bảo vệ bằng Cloudflare Access ở lớp ngoài.

**Hướng giải pháp đề xuất**

1. Kiểm tra production hiện có Cloudflare Access/WAF rule bảo vệ `/admin` và các API quản trị hay không.
2. Tách endpoint công khai `POST /api/quotes` khỏi các endpoint quản trị.
3. Yêu cầu danh tính/quyền admin cho `GET/PATCH/DELETE /api/quotes`, `PUT /api/content/*`, `POST /api/media` và import.
4. Trả `401` khi chưa đăng nhập và `403` khi thiếu quyền.
5. Ẩn liên kết Admin khỏi giao diện production công khai, nhưng không xem việc ẩn nút là biện pháp bảo mật.

**Tiêu chí hoàn thành dự kiến**

- Người dùng công khai vẫn gửi yêu cầu báo giá được.
- Người chưa xác thực không đọc, sửa, xóa hoặc import dữ liệu quản trị được.
- Có kiểm thử cho cả trường hợp được phép và bị từ chối.

### QA-001 — TypeScript đang lỗi tại FloatingButton

**Bằng chứng**

`npx.cmd tsc --noEmit` báo `Property 'border' does not exist` tại `src/components/FloatingButton.tsx:50`.

**Hướng giải pháp đề xuất**

- Khai báo kiểu dữ liệu nút nổi có `border?: string`, hoặc loại bỏ logic `border` nếu thiết kế không sử dụng.
- Chạy lại type-check và build sau khi sửa.

**Tiêu chí hoàn thành dự kiến**

- `npx.cmd tsc --noEmit` và `npm.cmd run build` cùng thành công.

### QA-002 — Thiếu quality gate trong quy trình build

**Bằng chứng**

- `package.json` chỉ có `dev`, `build`, `preview`, `format` và script migrate R2.
- Vite build vẫn thành công dù TypeScript đang báo lỗi.
- Chưa có test hoặc lint script.

**Hướng giải pháp đề xuất**

1. Thêm `typecheck` và `check` vào `package.json`.
2. Trước mắt đặt `check = typecheck + build`.
3. Sau đó thêm ESLint và một nhóm smoke test cho route, giỏ hàng, báo giá và quyền API.
4. Bắt buộc `check` chạy trước deploy hoặc trong CI.

### PERF-001 — Bundle JavaScript chính quá lớn

**Bằng chứng**

- Build tạo bundle chính khoảng 1.065 MB sau minify, khoảng 185 KB gzip.
- Vite cảnh báo chunk vượt 500 KB.
- `src/App.tsx` import đồng bộ tất cả page, kể cả `AdminPage` rất lớn.

**Hướng giải pháp đề xuất**

- Dùng `React.lazy()` và `Suspense` cho Admin, sản phẩm, tin tức, video và trình soạn thảo.
- Tách thư viện xử lý TIFF và các công cụ crop/editor khỏi bundle storefront.
- Đo lại kích thước và thời gian tải sau khi tách.

**Mục tiêu ban đầu**

- Storefront lần đầu không tải mã Admin/editor.
- Không còn chunk chính vượt 500 KB nếu không có lý do được ghi nhận.

### ROUTE-001 — Không có trang 404 thực sự

**Bằng chứng**

- Nhánh cuối của `parseRouteFromPath()` trả về `{ page: 'home' }` cho mọi URL không nhận diện được.

**Tác động**

- Người dùng không biết URL sai.
- Công cụ tìm kiếm có thể nhận diện soft-404.

**Hướng giải pháp đề xuất**

- Thêm route và component `NotFoundPage`.
- Cập nhật title/meta cho trang không tồn tại.
- Xác định chiến lược Worker trả HTTP 404 mà vẫn giữ được SPA navigation.

### CMS-001 — Lỗi tải CMS bị che giấu

**Bằng chứng**

- `fetchCloudflareSiteData()` bắt lỗi rồi “silently fall back to seed/localStorage”.

**Tác động**

- Website có thể hiển thị dữ liệu cũ nhưng người quản trị không biết API/D1 đang lỗi.

**Hướng giải pháp đề xuất**

- Storefront có thể tiếp tục fallback để duy trì khả dụng, nhưng cần ghi nhận trạng thái nguồn dữ liệu.
- Admin phải hiển thị cảnh báo rõ khi đang xem dữ liệu fallback hoặc khi đồng bộ thất bại.
- Thêm logging có cấu trúc và request ID ở Worker.

### SEO-001 — Metadata bài viết có thể dùng dữ liệu cũ

**Bằng chứng**

- `App` gọi `fetchCloudflareSiteData()` không chờ hoàn tất rồi cập nhật SEO ngay.
- Metadata trang chi tiết tin tức tìm bài trong dữ liệu local hiện có tại thời điểm đó.

**Hướng giải pháp đề xuất**

- Cho hàm tải CMS trả dữ liệu/sự kiện hoàn tất và cập nhật lại metadata sau khi đồng bộ.
- Tốt hơn về lâu dài: tạo metadata ở Worker/SSR hoặc prerender các route nội dung quan trọng.

### FEATURE-001 — Bản đồ và hệ thống phân phối đang tạm ngưng

**Bằng chứng**

- `MapPage.tsx` vẫn tồn tại.
- Các URL `/he-thong-phan-phoi`, `/dai-ly`, `/map`, `/lien-he` và `/contact` đều được chuyển sang trang Giới thiệu.

**Quyết định cần chốt**

- Khôi phục tính năng với dữ liệu đại lý thật; hoặc
- Xóa code MapPage và đổi menu/copy để không tạo kỳ vọng về tính năng chưa có.

### FEATURE-002 — Đăng ký nhận tin chưa hoạt động

**Bằng chứng**

- Footer có input email và nút gửi nhưng không có state, `form`, handler hoặc endpoint đăng ký.

**Hướng giải pháp đề xuất**

- Chọn nơi lưu subscription: dịch vụ email marketing hoặc D1.
- Thêm xác thực email, consent, trạng thái loading/success/error và chống spam.
- Nếu chưa triển khai backend, nên ẩn block này thay vì giữ một nút không phản hồi.

### ARCH-001 — Component quá lớn

**Bằng chứng**

- `AdminPage.tsx` khoảng 147 KB.
- `RichTextEditor.tsx`, `AdminProductsTab.tsx`, `ProductsPage.tsx` và `HomePage.tsx` cũng đang chứa nhiều trách nhiệm.

**Hướng giải pháp đề xuất**

- Tách Admin theo từng domain: dashboard, quotes, banners, news, videos, settings và backup.
- Tách logic tải/lưu thành hooks hoặc service.
- Chỉ refactor sau khi có smoke test để tránh thay đổi hành vi ngoài ý muốn.

### TOOL-001 — Cảnh báo tương thích Vite tương lai

**Bằng chứng**

- Build cảnh báo việc dùng `__dirname` trong `vite.config.ts`.
- JSON import `./.figma/make/site.json` chưa có import attribute.

**Hướng giải pháp đề xuất**

- Thay `__dirname` bằng `import.meta.dirname` hoặc cách tương thích ESM.
- Bổ sung JSON import attribute theo phiên bản TypeScript/Vite đang dùng.
- Chạy lại dev server và build để đảm bảo plugin Figma Make không bị ảnh hưởng.

### OPS-001 — Worktree cần được phân loại trước khi phát hành

**Bằng chứng tại thời điểm rà soát**

- Có thay đổi chưa commit trong `src/pages/ProductDetailPage.tsx`.
- Có file scratch bị xóa và nhiều ảnh, script sửa dữ liệu, bản backup D1 chưa được theo dõi.

**Hướng giải pháp đề xuất**

- Không xóa hoặc commit tự động các file này.
- Xác định thay đổi nào là sản phẩm, công cụ tạm, backup hoặc tài liệu nguồn.
- Stage theo file và kiểm tra diff trước mỗi commit/deploy.
- Bổ sung `.gitignore` cho loại artifact thực sự không nên lưu, sau khi được xác nhận.

### UX-001 — Cần một lượt kiểm thử giao diện riêng

**Trạng thái**

- Build và mã nguồn đã được rà soát.
- Công cụ điều khiển trình duyệt dừng vì không xác định được URL Chrome đủ chắc chắn, nên chưa hoàn thành kiểm tra trực quan desktop/mobile.

**Danh sách cần kiểm thử tiếp**

- Header/menu/mobile menu và trạng thái active.
- Slider trang chủ và CTA.
- Tìm kiếm, lọc, phân trang sản phẩm.
- Chọn biến thể, thêm nhiều SKU vào giỏ và khôi phục sau reload.
- Form báo giá và các trạng thái lỗi/thành công.
- News/video modal, nội dung dài và media lỗi.
- Admin ở desktop/mobile.
- Layout tại 390 px, 768 px, 1024 px và màn hình desktop lớn.
- Keyboard navigation, focus, label và contrast cơ bản.

## Thứ tự đề xuất để lên phương án chi tiết

1. SEC-001 — chốt mô hình xác thực và phạm vi API công khai/quản trị.
2. QA-001 + QA-002 — sửa lỗi TypeScript và dựng quality gate.
3. CMS-001 — làm rõ trạng thái dữ liệu và lỗi đồng bộ.
4. PERF-001 — tách bundle storefront/Admin.
5. ROUTE-001 + SEO-001 — hoàn thiện 404 và metadata.
6. FEATURE-001 + FEATURE-002 — quyết định giữ, hoàn thiện hay loại bỏ.
7. ARCH-001 + TOOL-001 — giảm nợ kỹ thuật sau khi có test bảo vệ.
8. UX-001 — kiểm thử trực quan và bổ sung issue cụ thể theo từng breakpoint.

## Nguyên tắc khi triển khai

- Không làm mất dữ liệu CMS, báo giá hoặc media đang lưu trên Cloudflare.
- Sao lưu production trước thay đổi migration hoặc dữ liệu.
- Không trộn các ảnh nguồn/backup/script tạm vào commit tính năng.
- Mỗi issue nên có một phạm vi nhỏ, kiểm tra riêng và tiêu chí nghiệm thu rõ ràng.
