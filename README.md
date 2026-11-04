# 🗳️ Class Voting & Feedback System (vote-app)

Hệ thống Bình chọn Lớp học & Đóng góp ý kiến gọn nhẹ, bảo mật, hoạt động trên nền tảng **Python**, **Streamlit** và **SQLite**.
Hỗ trợ cả giao diện **Web dành cho Học sinh**, **Cổng Quản trị trực tiếp trên Web dành cho Giáo viên** và **Admin CLI trên Terminal**.

---

## 📁 Cấu trúc Thư mục

```text
vote-app/
├── .gitignore          # Cấu hình bảo mật, bỏ qua file CSDL và venv
├── README.md           # Hướng dẫn chi tiết
├── requirements.txt    # Thư viện phụ thuộc (streamlit>=1.30.0)
├── students.json       # Danh sách 46 học sinh lớp 10B5
├── votes.db            # Cơ sở dữ liệu SQLite tự khởi tạo & an toàn
├── app.py              # Web app tích hợp 2 cổng: Học sinh + Giáo viên
└── admin.py            # CLI quản trị nâng cao trên Terminal
```

---

## 🚀 Hướng Dẫn Triển Khai Link Truy Cập Cho Học Sinh Từ Bất Kỳ Đâu

Học sinh có thể dùng điện thoại (4G / Wi-Fi) ở nhà hoặc lớp học để nhấp link vào bình chọn thông qua **Streamlit Cloud** (Miễn phí 100%, bảo mật HTTPS):

### Bước 1: Khởi tạo Git và đẩy lên GitHub của Thầy
Mở Terminal và gõ các lệnh sau:
```bash
cd ~/Project/vote-app
git init
git add .
git commit -m "Initial commit for vote-app"

# Đổi nhánh chính sang main
git branch -M main

# Tạo repo mới trên GitHub (ví dụ: vote-10a5) rồi liên kết và đẩy lên:
git remote add origin https://github.com/tranlequyengdtx-cmd/vote-10b5.git
git push -u origin main
```

### Bước 2: Kích hoạt trên Streamlit Cloud
1. Truy cập [share.streamlit.io](https://share.streamlit.io) và đăng nhập bằng tài khoản GitHub `tranlequyengdtx-cmd`.
2. Bấm nút **"Create app"** / **"New app"**.
3. Chọn Repository: `tranlequyengdtx-cmd/vote-10b5`, nhánh `main`, file chính `app.py`.
4. Bấm **"Deploy"**.

Hệ thống sẽ cấp ngay cho Thầy một đường link:
👉 **`https://vote-10b5.streamlit.app`** (Thầy có thể tùy chỉnh tên miền con theo ý muốn trong phần Settings của app).

---

## 🔒 Hai Chế Độ Trên Giao Diện Web (`app.py`)

Khi truy cập vào link web, ở thanh bên trái (Sidebar) có mục chuyển đổi chế độ:

### 1. 🎓 Chế độ Học sinh (Mặc định)
- Học sinh chỉ cần chọn đúng tên mình trong danh sách lớp.
- Lần đầu đăng nhập: Học sinh tự đặt Mã PIN cá nhân (4–6 số).
- Tiến hành tích chọn các bạn học sinh tiêu biểu (tên của học sinh đang đăng nhập tự động được ẩn đi).
- Ghi ý kiến đóng góp cho lớp/thầy cô (tùy chọn) ➔ Bấm **Lưu phiếu bình chọn**.

### 2. 🔒 Chế độ Giáo viên (Quản trị viên)
- Chọn mục **"🔒 Giáo viên (Quản trị)"** ở Sidebar và nhập **Mã PIN Admin** (Mặc định: `123456`).
- Sau khi đăng nhập, màn hình sẽ hiển thị 5 tab quản trị cực kỳ trực quan:
  1. **🏆 Bảng Xếp Hạng:** Xem kết quả Top 3, Top 5 hoặc Tất cả theo thời gian thực (kèm huy chương 🥇, 🥈, 🥉). Có nút **"📥 Tải Kết Quả Bình Chọn (File CSV)"** để mở bằng Excel.
  2. **💬 Ý Kiến Đóng Góp:** Đọc toàn bộ tâm tư, đề xuất của học sinh kèm mốc thời gian. Có nút **"📥 Tải Toàn Bộ Ý Kiến Đóng Góp (File CSV)"**.
  3. **📋 Quản Lý Tiêu Chí:** Tạo thêm tiêu chí mới hoặc xóa tiêu chí cũ ngay trên web.
  4. **📊 Tiến Độ Tham Gia:** Biểu đồ % tiến độ, thống kê số bạn đã nộp và danh sách cụ thể các bạn chưa tham gia để Thầy tiện nhắc nhở.
  5. **🔑 Reset Mã PIN:** Thầy có thể xóa mã PIN cũ cho học sinh nếu học sinh quên mã.

---

## 🛠️ Công Cụ Admin CLI (`admin.py`) Trên Terminal

Nếu Thầy muốn kiểm tra cục bộ trên máy tính của mình mà không cần mở trình duyệt:
```bash
cd ~/Project/vote-app

# 1. Thêm tiêu chí mới
python3 admin.py --add-crit "Học sinh tiêu biểu tháng 10"

# 2. Xem danh sách tiêu chí
python3 admin.py --list-crit

# 3. Xem Top 5 học sinh được vote nhiều nhất
python3 admin.py --top 5

# 4. Đọc góp ý của học sinh
python3 admin.py --feedback

# 5. Thống kê tiến độ tham gia của cả lớp
python3 admin.py --stats

# 6. Reset mã PIN cho học sinh
python3 admin.py --reset-pass "Bùi Hoàng Anh"
```
