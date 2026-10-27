# Nhiệm vụ Pilot: Tạo tiện ích định dạng tiền tệ Việt Nam (VND)

## Phạm vi cho phép (Strict Scope)
- Chỉ được tạo DUY NHẤT một file mới tại: `src/utils/currencyFormatter.ts`
- TUYỆT ĐỐI KHÔNG sửa đổi, tạo mới hoặc xóa bất kỳ file nào khác trong dự án.

## Yêu cầu kỹ thuật chi tiết
1. Tạo file TypeScript `src/utils/currencyFormatter.ts` với hàm chính:
   ```typescript
   export interface CurrencyFormatOptions {
     showUnit?: boolean // Mặc định là true (thêm "₫" vào cuối)
     fallback?: string  // Giá trị trả về khi đầu vào không hợp lệ (mặc định "—")
   }

   export function formatVietnameseCurrency(
     value: number | string | null | undefined,
     options?: CurrencyFormatOptions
   ): string
   ```
2. Yêu cầu xử lý logic:
   - Nếu `value` là `null`, `undefined`, `NaN` hoặc chuỗi rỗng: trả về `options?.fallback ?? '—'`.
   - Nếu `value` là số hợp lệ hoặc chuỗi số hợp lệ:
     - Định dạng dấu chấm (`.`) phân cách hàng nghìn theo chuẩn Việt Nam (ví dụ: `1500000` -> `"1.500.000 ₫"`).
     - Nếu `options?.showUnit === false`: không kèm ký hiệu `" ₫"` (ví dụ: `"1.500.000"`).
     - Hỗ trợ số âm (ví dụ: `-50000` -> `"-50.000 ₫"`).
     - Hỗ trợ số 0 (ví dụ: `0` -> `"0 ₫"`).
     - Xử lý làm tròn số thập phân hợp lý (mặc định làm tròn thành số nguyên vì tiền Việt Nam Đồng không dùng xu/hào).
3. Tiêu chuẩn mã nguồn:
   - Viết bằng TypeScript chuẩn, export đầy đủ types và JSDoc rõ ràng.
   - Không cài thêm bất kỳ thư viện ngoài nào (dùng JavaScript thuần hoặc Intl.NumberFormat).
   - Mã nguồn phải vượt qua `npm run check` (typecheck TypeScript strict không có lỗi `any` hay cú pháp).
