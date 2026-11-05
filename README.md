# 🗳️ Cổng Bình Chọn & Đóng Góp Ý Kiến Lớp 10B5 (Phong cách Mathflow)

Ứng dụng web tĩnh siêu nhẹ, tốc độ tức thì (0.1 giây), hoạt động trực tiếp trên **GitHub Pages** (không cần server trung gian, không có độ trễ). Kết quả và ý kiến góp ý của học sinh được tự động đổ về **Google Drive (Google Sheet)** của Thầy theo thời gian thực.

---

## 🌟 Điểm Nổi Bật

1. **Giao diện hiện đại giống Mathflow:** Thiết kế kính mờ (Glassmorphism), Dark/Light mode, font Outfit, tương thích 100% trên điện thoại học sinh.
2. **Đăng nhập siêu tốc (Không cần mật khẩu):** 
   - Ô tìm kiếm gợi ý thông minh (gõ 1-2 chữ cái là hiện họ tên đầy đủ).
   - Nút **"📋 Xem danh sách 46 bạn"** mở popup bảng chọn 1 chạm.
3. **Bình chọn kiểu trắc nghiệm nhiều lựa chọn:** Tích chọn các bạn xứng đáng, tên người đang bình chọn tự động được loại trừ.
4. **Mục Góp ý & Đề xuất riêng:** Học sinh có thể gửi gắm tâm tư, nguyện vọng hoặc đề xuất hoạt động cho lớp/Thầy Cô.
5. **Dashboard Tự Động Hóa 100% trên Google Drive:**
   - **Mục tiêu 1:** Hiển thị tức thì % tiến độ cả lớp (ví dụ: `42/46 học sinh đã nộp`) kèm danh sách cụ thể những em chưa nộp.
   - **Mục tiêu 2:** Bảng vàng **TOP 3 cao nhất** (🥇, 🥈, 🥉) tự động nhảy số và sắp xếp lại ngay khi học sinh bấm nộp.
   - **Mục tiêu 3:** Lưu toàn bộ nhật ký và ý kiến đóng góp riêng biệt, minh bạch.

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
