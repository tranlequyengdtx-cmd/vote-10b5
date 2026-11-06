// ==============================================================================
// CẤU HÌNH ĐỢT BÌNH CHỌN & TIÊU ĐỀ ỨNG DỤNG LỚP 10B5
// File này được quản lý tự động bởi CLI (admin.py) hoặc có thể sửa trực tiếp.
// ==============================================================================
const POLL_CONFIG = {
    // Mã đợt bình chọn. Khi thay đổi mã này, học sinh cả lớp sẽ được mở khóa
    // để bình chọn đợt mới mà không bị chặn bởi bộ nhớ trình duyệt cũ.
    roundId: "Tuan_45_2026_0611",

    // Tiêu đề và mô tả ở Màn hình 1 (Đăng nhập)
    appTitle: "Bình chọn Phó Trật Tự",
    appSubtitle: "Ghi nhận tình trạng làm ồn trong lớp • Bảo mật & Khách quan",

    // Lời nhắc và hướng dẫn ở Màn hình 2 (Bình chọn)
    promptTitle: "Chọn 1 hoặc 2,3  bạn mà em cho là có năng lực phù hợp với vị trí",
    promptDesc: "Bấm chọn vào tên của các bạn vi phạm nề nếp (có thể chọn nhiều bạn).",

    // Tiêu đề & mô tả phần phản ánh riêng
    feedbackTitle: "Ý Kiến Phản Ánh / Đề Xuất Cho GVCN (Tùy chọn)",
    feedbackDesc: "Em có phản ánh cụ thể về giờ học nào hoặc đề xuất biện pháp chấn chỉnh nề nếp cho Thầy không?",
    feedbackPlaceholder: "Nhập nội dung phản ánh hoặc đề xuất riêng tại đây (nếu có)...",

    // Chữ hiển thị trên nút nộp
    submitButtonText: "XÁC NHẬN NỘP PHIẾU PHẢN ÁNH",

    // Thời gian cập nhật
    updatedAt: "2026-11-06 21:58"
};

// Xuất ra môi trường Node.js (nếu dùng kiểm thử)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = POLL_CONFIG;
}
