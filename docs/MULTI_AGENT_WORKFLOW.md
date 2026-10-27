# Hướng dẫn Vận hành Hệ thống Multi-Agent Automation (Viễn Đông ABB)
*Phiên bản Đã Kiểm Định & Khóa An Toàn Tuyệt Đối (Hardened & Audited)*

Hệ thống tự động hóa phối hợp giữa **Antigravity (ATG)** (Planner, Orchestrator & Reviewer) và **OpenAI Codex CLI** (Developer) trên repository Viễn Đông ABB.

---

## 1. Phân định vai trò & Giới hạn thẩm quyền

| Thành phần | Vai trò | Trách nhiệm & Giới hạn |
| :--- | :--- | :--- |
| **User (Người dùng)** | Chủ dự án | • Giao yêu cầu ban đầu.<br>• Phê duyệt nghiệm thu cuối cùng.<br>• Nắm quyền quyết định duy nhất việc commit/merge/push. |
| **Antigravity (ATG)** | Planner, Orchestrator & Reviewer | • **Lập kế hoạch:** Xác định phạm vi file mục tiêu tối thiểu, chặt chẽ.<br>• **Điều phối:** Kích hoạt Runner cho từng vòng đơn lẻ (Single-Turn).<br>• **Reviewer độc lập:** Tự đọc toàn bộ file `changes.diff` (đã cô lập riêng của lượt chạy) và `summary.json`, kiểm tra logic, bảo mật và styling.<br>• **Loop Guard:** Quản lý số vòng sửa lỗi (tối đa 3 vòng), dừng khẩn cấp khi lỗi lặp hoặc quá thời gian. |
| **Codex CLI** | Developer | • Viết mã nguồn và sửa lỗi theo đặc tả trong task file.<br>• Chạy qua lệnh `codex.exe exec` với sandbox `--sandbox workspace-write`. |

---

## 2. Runner điều phối: `scripts/run-agent-task.mjs`

Runner là công cụ đóng gói thực thi cho **MỘT VÒNG DUY NHẤT (Single-Turn)** với 4 cơ chế bảo vệ nâng cao mới:

### A. Kiểm soát nghiêm ngặt Quality Gate
- **Quy tắc bất biến:** Nếu Quality Gate bị bỏ qua (`skipped: true`), trường `passed` **bắt buộc phải là `false`** và toàn bộ vòng chạy bị đánh dấu không đạt. Chỉ khi `npm run check` thực sự chạy và trả về exit code `0` thì `passed` mới bằng `true`.
- **Trong Chế độ Pilot (`--pilot`):** Tuyệt đối **cấm bỏ qua Quality Gate**. Bất kỳ lệnh nào kèm `--unsafe-skip-quality-gate` đều bị Runner chặn đứng (`[FAIL-CLOSED]`) trước khi chạy.

### B. Deep Content Snapshot Không Giới Hạn Size & Fail-Closed
- **Hash toàn bộ file:** Đọc từng khối 64 KB tuần tự để tính mã băm SHA-256 cho **mọi file không phân biệt dung lượng** (kể cả file trên 5 MB hay 50 MB).
- **Phát hiện nội dung cùng kích thước:** Phát hiện ngay cả khi file bị sửa nhưng giữ nguyên kích thước byte.
- **Fail-Closed:** Nếu bất kỳ file nào không thể đọc hoặc hash được, Runner dừng khẩn cấp và báo lỗi, không âm thầm bỏ qua.

### C. Cô lập Diff của riêng Lượt chạy Hiện tại (Turn-Isolated Diff)
- Runner lưu trữ snapshot nội dung trước khi chạy.
- Sau khi Codex hoàn tất, file `changes.diff` **CHỈ chứa những thay đổi do chính lượt chạy này tạo ra** (file sửa, file tạo mới và file xóa), hoàn toàn tách biệt khỏi các file dirty tồn tại từ trước trên working tree.
- Trạng thái Git từ trước được lưu riêng vào file `pre_existing_status.log` để phục vụ audit.

### D. Khóa cứng phạm vi Pilot (`--pilot`)
- Khi kích hoạt cờ `--pilot`:
  - Tham số `--allowed-paths` bắt buộc phải là chính xác file: `src/utils/currencyFormatter.ts`.
  - Mọi đường dẫn khác (kể cả thư mục `src/utils`) đều bị từ chối ngay từ vòng gửi xe.

---

## 3. Cách thức sử dụng Runner

### Kiểm tra cú pháp và tham số (Dry-run):
```powershell
node scripts/run-agent-task.mjs --dry-run --task-file scratch/task_pilot.md --allowed-paths "src/utils/currencyFormatter.ts" --pilot
```

### Chạy lượt Pilot thực tế (Khi được User duyệt):
```powershell
node scripts/run-agent-task.mjs `
  --task-file scratch/task_pilot.md `
  --allowed-paths "src/utils/currencyFormatter.ts" `
  --pilot `
  --timeout 180000
```

---

## 4. Ràng buộc bất biến (Hard Constraints)
1. **Không push / Không deploy:** Không tự tiện chạy `git push`, `wrangler deploy`, D1 migration hay Cloudflare R2 production.
2. **Không tự cấp quyền:** Không sửa Terminal Allow List/Deny List, duy trì Proceed in Sandbox của IDE.
3. **Bảo toàn Checkpoint:** Checkpoint `0c3eeeb` trên nhánh `checkpoint/pre-multi-agent-20261027` là điểm neo an toàn bất khả xâm phạm.
