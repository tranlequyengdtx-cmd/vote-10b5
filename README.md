# 📢 Cổng Khảo Sát Nề Nếp & Phản Ánh Làm Ồn Lớp 10B5 (Cuối Tuần)

Ứng dụng web tĩnh siêu nhẹ, tốc độ tức thì (0.1 giây), hoạt động trực tiếp trên **GitHub Pages** (không cần server trung gian, không có độ trễ). Kết quả phản ánh nề nếp và ý kiến của học sinh được tự động đổ về **Google Drive (Google Sheet)** của Thầy theo thời gian thực để GVCN kịp thời nhắc nhở, uốn nắn học sinh làm ồn trong tuần.

---

## 🌟 Điểm Nổi Bật

1. **Giao diện hiện đại giống Mathflow:** Thiết kế kính mờ (Glassmorphism), Dark/Light mode, font Outfit, tương thích 100% trên điện thoại học sinh.
2. **Đăng nhập bảo mật chống bầu hộ bằng Mã PIN Ngày Sinh (DDMM):** 
   - Ô tìm kiếm gợi ý thông minh hoặc bấm popup chọn tên.
   - Học sinh nhập 4 số Ngày & Tháng sinh (VD: `0509`, `2612`) để xác thực bảo vệ phiếu bầu.
   - Toàn bộ ngày sinh được băm một chiều **SHA-256**, không thể dịch ngược hay lộ thông tin.
3. **Cơ chế Chống Spam Vote (Mỗi bạn chỉ nộp 1 lần/tuần):**
   - Kiểm tra 3 lớp (Bộ nhớ trình duyệt, Tra cứu trực tuyến với Google Sheet, và Chốt chặn cứng ở Backend).
   - Ngăn chặn triệt để hành vi cố tình vote nhiều lần để "bơm điểm" cho bạn khác.
4. **Cơ chế Trọng số (Hệ số phiếu):** Thầy có thể đặt hệ số 2, 1.5, 3... cho Lớp trưởng / Ban cán sự nề nếp ở Cột F trên Sheet Dashboard. Mỗi lượt chọn của bạn đó sẽ được nhân với hệ số này.
5. **Bắt đầu đợt mới trong 1 Click:** Menu tự động trên Google Sheets giúp Thầy sao lưu kết quả tuần cũ và reset bảng sạch sẽ cho tuần mới (vẫn giữ nguyên Cột F Hệ số).
6. **Mục Góp ý & Phản ánh riêng:** Học sinh gửi ý kiến riêng tư cho GVCN kèm theo phiếu.
7. **Dashboard Tự Động Hóa 100% trên Google Drive:**
   - Cập nhật tiến độ cả lớp (ví dụ: `42/46 học sinh đã nộp`).
   - Bảng cảnh báo **TOP 3 bạn làm ồn nhiều nhất** (🔴 Top 1, 🟠 Top 2, 🟡 Top 3) tự động cập nhật theo điểm phản ánh.
   - Lưu nhật ký chi tiết và lời nhắn riêng biệt.

---

## 📁 Cấu Trúc File

```text
vote-app/
├── index.html           # Giao diện chính (3 màn hình: Chọn tên -> Bình chọn & Góp ý -> Thành công)
├── style.css            # Bộ phong cách Glassmorphism đồng bộ với Mathflow
├── app.js               # Logic chọn bạn, lọc tìm kiếm, gửi dữ liệu về Google
├── students.js          # Danh sách 46 học sinh lớp 10B5
├── GoogleAppsScript.js  # Mã nguồn dán vào Google Sheet để tự động tạo Dashboard
└── README.md            # Tài liệu hướng dẫn
```

---

## 🚀 Hướng Dẫn Vận Hành Trong 2 Bước

### BƯỚC 1: Kích hoạt GitHub Pages để lấy link gửi học sinh (30 giây)

1. Mở trang repo của Thầy trên GitHub: [https://github.com/tranlequyengdtx-cmd/vote-10b5](https://github.com/tranlequyengdtx-cmd/vote-10b5)
2. Chọn **Settings** (ở thanh menu trên cùng của repo).
3. Ở menu bên trái, chọn **Pages**.
4. Tại mục **Build and deployment** -> **Branch**:
   - Chọn nhánh **`main`** và thư mục **`/ (root)`**.
   - Bấm **Save**.
5. Đợi khoảng 1 phút, GitHub sẽ cấp cho Thầy đường link công khai:
   👉 **`https://tranlequyengdtx-cmd.github.io/vote-10b5/`**
*(Thầy gửi link này vào Zalo lớp để học sinh vào bình chọn)*

---

### BƯỚC 2: Cấu hình file Google Sheet trên Drive để nhận kết quả (1 phút)

1. Mở [Google Drive](https://drive.google.com) của Thầy, tạo một **Google Trang tính (Google Sheets)** mới, đặt tên: `Bình Chọn Lớp 10B5`.
2. Trên thanh menu của Google Sheet, chọn: **Tiện ích mở rộng (Extensions)** ➔ **Apps Script**.
3. Xóa hết code cũ, mở file [GoogleAppsScript.js](file:///Users/tranlequyen/Project/vote-app/GoogleAppsScript.js) copy toàn bộ và DÁN VÀO.
4. Ở thanh công cụ, chọn hàm **`khoiTaoDashboard`** và bấm nút **Chạy (Run)** (cấp quyền lần đầu nếu Google hỏi).
   *(Lúc này quay lại Google Sheet Thầy sẽ thấy Bảng Dashboard và Bảng Vàng Top 3 tự động được tạo và kẻ viền tuyệt đẹp!)*
5. Bấm nút màu xanh **Triển khai (Deploy)** ở góc trên bên phải ➔ **Tùy chọn triển khai mới (New deployment)**:
   - Chọn loại: **Ứng dụng web (Web app)**.
   - Thực thi dưới dạng (Execute as): **Tôi (Me)**.
   - Ai có quyền truy cập (Who has access): **Bất kỳ ai (Anyone)**.
   - Bấm **Triển khai (Deploy)**.
6. Copy đường link **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
7. Mở file [app.js](file:///Users/tranlequyen/Project/vote-app/app.js) dán URL đó vào dòng số 6 thay cho URL mẫu, rồi commit/push lên GitHub.

---

## 📊 Trải Nghiệm Của Thầy Trên Google Sheet

Mỗi khi học sinh trong lớp bấm nộp phiếu:
- Thầy chỉ cần mở file Google Sheet trên điện thoại hoặc máy tính:
  - Xem ngay ai đứng **Hạng 1, Hạng 2, Hạng 3** với bao nhiêu phiếu.
  - Xem ngay bạn nào chưa nộp phiếu để nhắc nhở.
  - Đọc toàn bộ ý kiến, đề xuất của học sinh ở trang tính `NHAT_KY_VA_GOP_Y`.
