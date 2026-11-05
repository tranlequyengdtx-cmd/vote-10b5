/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: HỆ THỐNG QUẢN TRỊ BÌNH CHỌN & GÓP Ý LỚP 10B5
 * ==============================================================================
 * HƯỚNG DẪN CÀI ĐẶT (MẤT 1 PHÚT):
 * 1. Mở Google Drive của Thầy (https://drive.google.com).
 * 2. Tạo một Trang tính mới (Google Sheets), đặt tên: "Bình Chọn Lớp 10B5".
 * 3. Trên thanh menu, chọn: Tiện ích mở rộng (Extensions) -> Apps Script.
 * 4. Xóa hết mã có sẵn trong file Code.gs, rồi COPY TOÀN BỘ file này DÁN VÀO.
 * 5. Chọn hàm "khoiTaoDashboard" ở thanh công cụ và bấm "Chạy" (Run) một lần duy nhất
 *    (Cấp quyền cho script khi được hỏi). Bảng Dashboard sẽ tự động được tạo và kẻ viền đẹp mắt!
 * 6. Bấm nút màu xanh "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment):
 *    - Loại: "Ứng dụng web" (Web app).
 *    - Mô tả: "Vote 10B5 Web App".
 *    - Thực thi dưới dạng (Execute as): "Tôi" (Me).
 *    - Ai có quyền truy cập (Who has access): "Bất kỳ ai" (Anyone).
 * 7. Bấm "Triển khai" và COPY "URL ứng dụng web" (dạng https://script.google.com/.../exec).
 * 8. Dán URL này vào dòng 6 của file app.js trong repo vote-10b5!
 * ==============================================================================
 */

// Danh sách 46 học sinh chuẩn của lớp 10B5
const DANH_SACH_10B5 = [
  "Bùi Hoàng Anh", "Huỳnh Nguyễn Bảo Anh", "Nguyễn Phước Anh", "Phạm Thị Hồng Anh",
  "Võ Lâm Hùng Anh", "Đặng Thái Bảo", "Nguyễn Văn Chinh", "Võ Minh Duy",
  "Dương Thị Thùy Dương", "Dương Tấn Đạt", "Nguyễn Bùi Tấn Đạt", "Nguyễn Quang Đạt",
  "Nguyễn Huỳnh Giang", "Lê Minh Giàu", "Nguyễn Quốc Hào", "Nguyễn Văn Hiền",
  "Phạm Ngọc Hiệu", "Nguyễn Quốc Huy", "Trịnh Hoàng Huy", "Nguyễn Duy Khang",
  "Trần Quốc Kiệt", "Võ Tuấn Kiệt", "Võ Chí Kỳ", "Nguyễn Tấn Lộc",
  "Đặng Quyền Lợi", "Nguyễn Phước Luân", "Phan Hữu Luân", "Nguyễn Duy Minh",
  "Trần Dương Nam", "Giảng Hữu Nghĩa", "Đinh Hoàn Nhất", "Nguyễn Hữu Nhơn",
  "Nguyễn Hữu Thái", "Trần Duy Thanh", "Lê Thanh Thảo", "Nguyễn Quốc Thịnh",
  "Nguyễn Văn Thịnh", "Nguyễn Thanh Thúy", "Nguyễn Hồ Hoàng Tín", "Nguyễn Minh Trí",
  "Diệp Minh Nhật Trường", "Lê Gia Trường", "Nguyễn Vủ Trường", "Trần Thái Tú",
  "Phạm La Trí Tường", "Nguyễn Lê Hoàng Vũ"
];

const SHEET_DASHBOARD = "DASHBOARD";
const SHEET_LOG = "NHAT_KY_VA_GOP_Y";

/**
 * HÀM 1: KHỞI TẠO TỰ ĐỘNG TOÀN BỘ GIAO DIỆN SHEET DASHBOARD (CHẠY 1 LẦN)
 */
function khoiTaoDashboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tạo Sheet DASHBOARD
  let sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
  if (!sheetDash) {
    sheetDash = ss.insertSheet(SHEET_DASHBOARD, 0);
  }
  sheetDash.clear();
  // (gridlines hiển thị mặc định, không cần gọi thêm)

  // 2. Tạo Sheet NHAT_KY_VA_GOP_Y
  let sheetLog = ss.getSheetByName(SHEET_LOG);
  if (!sheetLog) {
    sheetLog = ss.insertSheet(SHEET_LOG, 1);
  }
  if (sheetLog.getLastRow() === 0) {
    sheetLog.appendRow(["Thời Gian", "Người Bình Chọn", "Các Bạn Được Chọn", "Ý Kiến Đóng Góp / Đề Xuất"]);
    sheetLog.getRange("A1:D1").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    sheetLog.setColumnWidth(1, 160);
    sheetLog.setColumnWidth(2, 180);
    sheetLog.setColumnWidth(3, 300);
    sheetLog.setColumnWidth(4, 400);
  }

  // --- THIẾT KẾ GIAO DIỆN TRANG DASHBOARD ---
  // A. Tiêu đề
  sheetDash.getRange("A1:E1").merge()
    .setValue("📊 BẢNG THEO DÕI TIẾN ĐỘ & KẾT QUẢ BÌNH CHỌN LỚP 10B5")
    .setFontSize(14).setFontWeight("bold").setFontColor("#ffffff")
    .setBackground("#0ea5e9").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheetDash.setRowHeight(1, 40);

  // B. Khung Thống kê tiến độ
  sheetDash.getRange("A2").setValue("Tổng số HS:");
  sheetDash.getRange("B2").setValue(DANH_SACH_10B5.length).setFontWeight("bold");
  sheetDash.getRange("C2").setValue("Đã nộp phiếu:");
  sheetDash.getRange("D2").setFormula(`=COUNTIF(C12:C57, "*Đã nộp*")`).setFontWeight("bold").setFontColor("#16a34a");
  sheetDash.getRange("E2").setFormula(`=TEXT(D2/B2, "0.0%")`).setFontWeight("bold").setFontColor("#0284c7");
  sheetDash.getRange("A2:E2").setBackground("#f1f5f9").setFontSize(11).setVerticalAlignment("middle");
  sheetDash.setRowHeight(2, 28);

  // C. BẢNG VÀNG TOP 3 BÌNH CHỌN CAO NHẤT
  sheetDash.getRange("A4:E4").merge().setValue("🏆 BẢNG VÀNG TOP 3 HỌC SINH ĐƯỢC BÌNH CHỌN CAO NHẤT")
    .setFontWeight("bold").setFontColor("#ffffff").setBackground("#8b5cf6").setHorizontalAlignment("center");
  
  sheetDash.getRange("A5:E5").setValues([["Huy Chương", "Họ và Tên", "Số Phiếu Bầu", "Tỉ Lệ Được Bầu", "Ghi Chú"]]);
  sheetDash.getRange("A5:E5").setFontWeight("bold").setBackground("#ede9fe").setHorizontalAlignment("center");

  // Công thức tự động trích xuất Top 1, Top 2, Top 3 theo số phiếu
  sheetDash.getRange("A6:E8").setValues([
    ["🥇 HẠNG 1", `=INDEX(SORT(B12:D57, 3, FALSE), 1, 1)`, `=INDEX(SORT(B12:D57, 3, FALSE), 1, 3)`, `=IF(D2>0, TEXT(C6/D2, "0.0%"), "0%")`, "Xuất sắc nhất"],
    ["🥈 HẠNG 2", `=INDEX(SORT(B12:D57, 3, FALSE), 2, 1)`, `=INDEX(SORT(B12:D57, 3, FALSE), 2, 3)`, `=IF(D2>0, TEXT(C7/D2, "0.0%"), "0%")`, "Tiêu biểu"],
    ["🥉 HẠNG 3", `=INDEX(SORT(B12:D57, 3, FALSE), 3, 1)`, `=INDEX(SORT(B12:D57, 3, FALSE), 3, 3)`, `=IF(D2>0, TEXT(C8/D2, "0.0%"), "0%")`, "Tiêu biểu"]
  ]);
  sheetDash.getRange("A6:E8").setFontSize(11).setVerticalAlignment("middle");
  sheetDash.getRange("A6:A8").setFontWeight("bold").setHorizontalAlignment("center");
  sheetDash.getRange("C6:D8").setHorizontalAlignment("center");

  // D. DANH SÁCH CHI TIẾT 46 HỌC SINH
  sheetDash.getRange("A10:E10").merge().setValue("📋 DANH SÁCH CHI TIẾT THEO DÕI CẢ LỚP (46 HỌC SINH)")
    .setFontWeight("bold").setBackground("#334155").setFontColor("#ffffff").setHorizontalAlignment("center");
  
  sheetDash.getRange("A11:E11").setValues([["STT", "Họ và Tên", "Trạng Thái Nộp", "Lượt Được Bầu", "Thời Gian Nộp"]]);
  sheetDash.getRange("A11:E11").setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");

  // Điền danh sách 46 bạn
  const rows = [];
  for (let i = 0; i < DANH_SACH_10B5.length; i++) {
    rows.push([i + 1, DANH_SACH_10B5[i], "⏳ CHƯA NỘP", 0, ""]);
  }
  sheetDash.getRange(12, 1, rows.length, 5).setValues(rows);
  sheetDash.getRange("A12:A57").setHorizontalAlignment("center");
  sheetDash.getRange("C12:E57").setHorizontalAlignment("center");

  // Định dạng độ rộng cột
  sheetDash.setColumnWidth(1, 100);
  sheetDash.setColumnWidth(2, 220);
  sheetDash.setColumnWidth(3, 150);
  sheetDash.setColumnWidth(4, 130);
  sheetDash.setColumnWidth(5, 170);

  // Kẻ viền bảng đẹp mắt
  sheetDash.getRange("A1:E8").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
  sheetDash.getRange("A10:E57").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  SpreadsheetApp.flush();
}

/**
 * HÀM 2: TIẾP NHẬN PHIẾU BÌNH CHỌN & GÓP Ý TỪ WEB APP (doPost)
 */
function doPost(e) {
  try {
    let data;
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      data = e.parameter;
    }

    const voter = (data.voter || "").trim();
    const selected = data.selected || [];
    const feedback = (data.feedback || "").trim();
    const timestamp = data.timestamp || new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    if (!voter) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Missing voter name" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
    let sheetLog = ss.getSheetByName(SHEET_LOG);

    // Nếu chưa khởi tạo thì tự động khởi tạo
    if (!sheetDash || !sheetLog) {
      khoiTaoDashboard();
      sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
      sheetLog = ss.getSheetByName(SHEET_LOG);
    }

    // 1. Ghi nhật ký vào Sheet NHAT_KY_VA_GOP_Y
    sheetLog.appendRow([timestamp, voter, selected.join(", "), feedback]);

    // 2. Cập nhật Dashboard
    // Lấy dữ liệu 46 học sinh từ hàng 12 đến hàng 57 (Cột A đến E)
    const dataRange = sheetDash.getRange(12, 1, 46, 5);
    const values = dataRange.getValues();

    // Tìm dòng của người bầu (voter) để đánh dấu đã nộp
    for (let i = 0; i < values.length; i++) {
      if (values[i][1] === voter) {
        values[i][2] = "✅ Đã nộp phiếu";
        values[i][4] = timestamp;
        break;
      }
    }

    // Tăng số phiếu cho các bạn được chọn
    for (let targetName of selected) {
      for (let i = 0; i < values.length; i++) {
        if (values[i][1] === targetName) {
          const currentVotes = parseInt(values[i][3]) || 0;
          values[i][3] = currentVotes + 1;
          break;
        }
      }
    }

    // Ghi ngược lại Dashboard
    dataRange.setValues(values);
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Recorded successfully" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HÀM 3: KIỂM TRA TRẠNG THÁI WEB (doGet)
 */
function doGet(e) {
  return ContentService.createTextOutput("Hệ thống Google Apps Script cho Lớp 10B5 đang hoạt động bình thường 24/7.")
    .setMimeType(ContentService.MimeType.TEXT);
}
