/**
 * ==============================================================================
 * GOOGLE APPS SCRIPT: HỆ THỐNG QUẢN TRỊ BÌNH CHỌN LỚP 10B5 (PHIÊN BẢN 2.0)
 * ==============================================================================
 * TÍNH NĂNG MỚI:
 * 1. Tự động tính TRỌNG SỐ (Cột F - Hệ Số Bầu): Thầy có thể đặt hệ số 2, 1.5, 3...
 *    cho bạn cán bộ lớp/lớp trưởng. Bình chọn của bạn đó sẽ được nhân với hệ số này!
 * 2. Tự động LƯU TRỮ & RESET ĐỢT MỚI: Menu trên thanh công cụ của Google Sheet
 *    cho phép Thầy sao lưu kết quả đợt cũ và reset bảng trong 1 cú click!
 * 3. Hỗ trợ xác thực bảo mật mã PIN ngày sinh (DDMM).
 * ==============================================================================
 */

// Danh sách 46 học sinh chuẩn của lớp 10B5 kèm Ngày sinh
const DANH_SACH_10B5 = [
  {
    "stt": 1,
    "name": "Bùi Hoàng Anh",
    "dob": "26/12/2011"
  },
  {
    "stt": 2,
    "name": "Huỳnh Nguyễn Bảo Anh",
    "dob": "9/11/2010"
  },
  {
    "stt": 3,
    "name": "Nguyễn Phước Anh",
    "dob": "18/11/2011"
  },
  {
    "stt": 4,
    "name": "Phạm Thị Hồng Anh",
    "dob": "18/10/2011"
  },
  {
    "stt": 5,
    "name": "Võ Lâm Hùng Anh",
    "dob": "1/11/2011"
  },
  {
    "stt": 6,
    "name": "Đặng Thái Bảo",
    "dob": "07/07/2011"
  },
  {
    "stt": 7,
    "name": "Nguyễn Văn Chinh",
    "dob": "17/8/2011"
  },
  {
    "stt": 8,
    "name": "Võ Minh Duy",
    "dob": "02/04/2011"
  },
  {
    "stt": 9,
    "name": "Dương Thị Thùy Dương",
    "dob": "1/7/2011"
  },
  {
    "stt": 10,
    "name": "Dương Tấn Đạt",
    "dob": "14/6/2011"
  },
  {
    "stt": 11,
    "name": "Nguyễn Bùi Tấn Đạt",
    "dob": "29/11/2011"
  },
  {
    "stt": 12,
    "name": "Nguyễn Quang Đạt",
    "dob": "2/6/2011"
  },
  {
    "stt": 13,
    "name": "Nguyễn Huỳnh Giang",
    "dob": "27/6/2011"
  },
  {
    "stt": 14,
    "name": "Lê Minh Giàu",
    "dob": "15/07/2011"
  },
  {
    "stt": 15,
    "name": "Nguyễn Quốc Hào",
    "dob": "2/9/2011"
  },
  {
    "stt": 16,
    "name": "Nguyễn Văn Hiền",
    "dob": "24/06/2011"
  },
  {
    "stt": 17,
    "name": "Phạm Ngọc Hiệu",
    "dob": "04/09/2011"
  },
  {
    "stt": 18,
    "name": "Nguyễn Quốc Huy",
    "dob": "28/11/2011"
  },
  {
    "stt": 19,
    "name": "Trịnh Hoàng Huy",
    "dob": "11/08/2011"
  },
  {
    "stt": 20,
    "name": "Nguyễn Duy Khang",
    "dob": "1/12/2011"
  },
  {
    "stt": 21,
    "name": "Trần Quốc Kiệt",
    "dob": "04/04/2011"
  },
  {
    "stt": 22,
    "name": "Võ Tuấn Kiệt",
    "dob": "20/12/2011"
  },
  {
    "stt": 23,
    "name": "Võ Chí Kỳ",
    "dob": "15/08/2011"
  },
  {
    "stt": 24,
    "name": "Nguyễn Tấn Lộc",
    "dob": "25/06/2011"
  },
  {
    "stt": 25,
    "name": "Đặng Quyền Lợi",
    "dob": "25/9/2010"
  },
  {
    "stt": 26,
    "name": "Nguyễn Phước Luân",
    "dob": "30/05/2011"
  },
  {
    "stt": 27,
    "name": "Phan Hữu Luân",
    "dob": "2/4/2011"
  },
  {
    "stt": 28,
    "name": "Nguyễn Duy Minh",
    "dob": "04/07/2011"
  },
  {
    "stt": 29,
    "name": "Trần Dương Nam",
    "dob": "11/12/2011"
  },
  {
    "stt": 30,
    "name": "Giảng Hữu Nghĩa",
    "dob": "9/5/2011"
  },
  {
    "stt": 31,
    "name": "Đinh Hoàn Nhất",
    "dob": "18/07/2011"
  },
  {
    "stt": 32,
    "name": "Nguyễn Hữu Nhơn",
    "dob": "14/4/2011"
  },
  {
    "stt": 33,
    "name": "Nguyễn Hữu Thái",
    "dob": "16/12/2010"
  },
  {
    "stt": 34,
    "name": "Trần Duy Thanh",
    "dob": "10/8/2011"
  },
  {
    "stt": 35,
    "name": "Lê Thanh Thảo",
    "dob": "22/12/2011"
  },
  {
    "stt": 36,
    "name": "Nguyễn Quốc Thịnh",
    "dob": "19/02/2011"
  },
  {
    "stt": 37,
    "name": "Nguyễn Văn Thịnh",
    "dob": "9/1/2011"
  },
  {
    "stt": 38,
    "name": "Nguyễn Thanh Thúy",
    "dob": "21/9/2011"
  },
  {
    "stt": 39,
    "name": "Nguyễn Hồ Hoàng Tín",
    "dob": "28/09/2011"
  },
  {
    "stt": 40,
    "name": "Nguyễn Minh Trí",
    "dob": "28/12/2011"
  },
  {
    "stt": 41,
    "name": "Diệp Minh Nhật Trường",
    "dob": "11/05/2011"
  },
  {
    "stt": 42,
    "name": "Lê Gia Trường",
    "dob": "27/08/2011"
  },
  {
    "stt": 43,
    "name": "Nguyễn Vủ Trường",
    "dob": "11/06/2011"
  },
  {
    "stt": 44,
    "name": "Trần Thái Tú",
    "dob": "07/04/2011"
  },
  {
    "stt": 45,
    "name": "Phạm La Trí Tường",
    "dob": "13/05/2011"
  },
  {
    "stt": 46,
    "name": "Nguyễn Lê Hoàng Vũ",
    "dob": "06/08/2011"
  }
];

const SHEET_DASHBOARD = "DASHBOARD";
const SHEET_LOG = "NHAT_KY_VA_GOP_Y";

/**
 * MENU TỰ ĐỘNG XUẤT HIỆN KHI MỞ GOOGLE SHEETS
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🗳️ Quản Trị Lớp 10B5")
    .addItem("🔄 Bắt đầu đợt bình chọn mới (Tự động sao lưu)", "taoDotBinhChonMoi")
    .addSeparator()
    .addItem("🛠️ Khởi tạo lại giao diện chuẩn Dashboard", "khoiTaoDashboard")
    .addToUi();
}

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

  // 2. Tạo Sheet NHAT_KY_VA_GOP_Y
  let sheetLog = ss.getSheetByName(SHEET_LOG);
  if (!sheetLog) {
    sheetLog = ss.insertSheet(SHEET_LOG, 1);
  }
  if (sheetLog.getLastRow() === 0) {
    sheetLog.appendRow(["Thời Gian", "Người Phản Ánh", "Hệ Số Phiếu", "Các Bạn Làm Ồn Đã Chọn", "Ý Kiến Phản Ánh / Đề Xuất Cho GVCN"]);
    sheetLog.getRange("A1:E1").setBackground("#1e293b").setFontColor("#ffffff").setFontWeight("bold");
    sheetLog.setColumnWidth(1, 160);
    sheetLog.setColumnWidth(2, 180);
    sheetLog.setColumnWidth(3, 110);
    sheetLog.setColumnWidth(4, 320);
    sheetLog.setColumnWidth(5, 400);
  }

  // --- THIẾT KẾ GIAO DIỆN TRANG DASHBOARD ---
  // A. Tiêu đề
  sheetDash.getRange("A1:G1").merge()
    .setValue("📢 BẢNG THEO DÕI NỀ NẾP & PHẢN ÁNH LÀM ỒN TRONG GIỜ HỌC - LỚP 10B5")
    .setFontSize(14).setFontWeight("bold").setFontColor("#ffffff")
    .setBackground("#0284c7").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheetDash.setRowHeight(1, 40);

  // B. Khung Thống kê tiến độ
  sheetDash.getRange("A2").setValue("Tổng số HS:");
  sheetDash.getRange("B2").setValue(DANH_SACH_10B5.length).setFontWeight("bold").setHorizontalAlignment("center");
  sheetDash.getRange("C2").setValue("Đã nộp phiếu:");
  sheetDash.getRange("D2").setFormula(`=COUNTIF(C12:C57, "*Đã nộp*")`).setFontWeight("bold").setFontColor("#16a34a").setHorizontalAlignment("center");
  sheetDash.getRange("E2").setValue("Tỉ lệ hoàn thành:");
  sheetDash.getRange("F2:G2").merge().setFormula(`=TEXT(D2/B2, "0.0%")`).setFontWeight("bold").setFontColor("#0284c7").setHorizontalAlignment("center");
  sheetDash.getRange("A2:G2").setBackground("#f1f5f9").setFontSize(11).setVerticalAlignment("middle");
  sheetDash.setRowHeight(2, 28);

  // HÀNG 3: CẤU HÌNH NHANH TIÊU ĐỀ & MÃ ĐỢT BÌNH CHỌN (GVCN SỬA TẠI ĐÂY LÀ WEB ĐỔI NGAY TỨC THÌ)
  sheetDash.getRange("A3").setValue("🏷️ Chủ Đề Đợt:").setFontWeight("bold").setBackground("#fef9c3").setVerticalAlignment("middle");
  sheetDash.getRange("B3:D3").merge().setValue("Bình chọn những bạn làm ồn trong giờ học -- Tuần 10").setFontWeight("bold").setFontColor("#b45309").setVerticalAlignment("middle");
  sheetDash.getRange("E3").setValue("Mã Đợt (Round):").setFontWeight("bold").setBackground("#fef9c3").setVerticalAlignment("middle");
  sheetDash.getRange("F3:G3").merge().setValue("Tuan_10_2026").setFontWeight("bold").setFontColor("#0369a1").setHorizontalAlignment("center").setVerticalAlignment("middle");
  sheetDash.setRowHeight(3, 30);

  // C. BẢNG CẢNH BÁO TOP 3 HỌC SINH LÀM ỒN NHIỀU NHẤT
  sheetDash.getRange("A4:G4").merge().setValue("⚠️ TOP 3 HỌC SINH BỊ PHẢN ÁNH LÀM ỒN / MẤT TRẬT TỰ NHIỀU NHẤT")
    .setFontWeight("bold").setFontColor("#ffffff").setBackground("#dc2626").setHorizontalAlignment("center");
  sheetDash.setRowHeight(4, 30);
  
  sheetDash.getRange("A5:G5").setValues([["Thứ Hạng", "Họ và Tên", "Điểm Làm Ồn", "Tỉ Lệ Bị Phản Ánh", "Biện Pháp Xử Lý", "", ""]]);
  sheetDash.getRange("A5:G5").setFontWeight("bold").setBackground("#fee2e2").setHorizontalAlignment("center");
  sheetDash.getRange("E5:G5").merge();

  // Công thức tự động trích xuất Top 1, Top 2, Top 3 theo Điểm Làm Ồn (Cột D)
  sheetDash.getRange("A6:G8").setValues([
    ["🔴 TOP 1 (Nhiều nhất)", `=INDEX(SORT(B12:F57, 3, FALSE), 1, 1)`, `=INDEX(SORT(B12:F57, 3, FALSE), 1, 3)`, `=IF(D2>0, TEXT(C6/D2, "0.0%"), "0%")`, "Nhắc nhở & Xử lý nghiêm", "", ""],
    ["🟠 TOP 2", `=INDEX(SORT(B12:F57, 3, FALSE), 2, 1)`, `=INDEX(SORT(B12:F57, 3, FALSE), 2, 3)`, `=IF(D2>0, TEXT(C7/D2, "0.0%"), "0%")`, "Nhắc nhở trước lớp", "", ""],
    ["🟡 TOP 3", `=INDEX(SORT(B12:F57, 3, FALSE), 3, 1)`, `=INDEX(SORT(B12:F57, 3, FALSE), 3, 3)`, `=IF(D2>0, TEXT(C8/D2, "0.0%"), "0%")`, "Nhắc nhở nề nếp", "", ""]
  ]);
  sheetDash.getRange("E6:G6").merge();
  sheetDash.getRange("E7:G7").merge();
  sheetDash.getRange("E8:G8").merge();

  sheetDash.getRange("A6:G8").setFontSize(11).setVerticalAlignment("middle");
  sheetDash.getRange("A6:A8").setFontWeight("bold").setHorizontalAlignment("center");
  sheetDash.getRange("C6:D8").setHorizontalAlignment("center");
  sheetDash.getRange("E6:G8").setHorizontalAlignment("center");

  // D. DANH SÁCH CHI TIẾT 46 HỌC SINH
  sheetDash.getRange("A10:G10").merge().setValue("📋 DANH SÁCH THEO DÕI NỀ NẾP CHI TIẾT CẢ LỚP (46 HỌC SINH)")
    .setFontWeight("bold").setBackground("#334155").setFontColor("#ffffff").setHorizontalAlignment("center");
  sheetDash.setRowHeight(10, 30);
  
  sheetDash.getRange("A11:G11").setValues([["STT", "Họ và Tên", "Trạng Thái Nộp", "Điểm Làm Ồn", "Thời Gian Nộp", "Hệ Số Bầu (Trọng Số)", "Ngày Sinh"]]);
  sheetDash.getRange("A11:G11").setFontWeight("bold").setBackground("#e2e8f0").setHorizontalAlignment("center");

  // Điền danh sách 46 bạn
  const rows = [];
  for (let i = 0; i < DANH_SACH_10B5.length; i++) {
    const s = DANH_SACH_10B5[i];
    rows.push([s.stt, s.name, "⏳ CHƯA NỘP", 0, "", 1, s.dob]);
  }
  sheetDash.getRange(12, 1, rows.length, 7).setValues(rows);
  sheetDash.getRange("A12:A57").setHorizontalAlignment("center");
  sheetDash.getRange("C12:E57").setHorizontalAlignment("center");
  sheetDash.getRange("F12:F57").setHorizontalAlignment("center").setFontWeight("bold").setBackground("#fef3c7");
  sheetDash.getRange("G12:G57").setHorizontalAlignment("center").setFontColor("#64748b");

  // Định dạng độ rộng cột
  sheetDash.setColumnWidth(1, 60);  // STT
  sheetDash.setColumnWidth(2, 220); // Họ tên
  sheetDash.setColumnWidth(3, 140); // Trạng thái
  sheetDash.setColumnWidth(4, 120); // Điểm
  sheetDash.setColumnWidth(5, 160); // Thời gian
  sheetDash.setColumnWidth(6, 170); // Hệ số bầu
  sheetDash.setColumnWidth(7, 120); // Ngày sinh

  // Kẻ viền bảng đẹp mắt
  sheetDash.getRange("A1:G8").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);
  sheetDash.getRange("A10:G57").setBorder(true, true, true, true, true, true, "#cbd5e1", SpreadsheetApp.BorderStyle.SOLID);

  SpreadsheetApp.flush();
}

/**
 * HÀM 2: TỰ ĐỘNG SAO LƯU KẾT QUẢ ĐỢT CŨ & RESET ĐỂ TẠO ĐỢT MỚI
 */
function taoDotBinhChonMoi() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const confirm = ui.alert(
    "🔄 BẮT ĐẦU ĐỢT BÌNH CHỌN MỚI",
    "Hệ thống sẽ:\n" +
    "1. Tự động sao lưu toàn bộ kết quả hiện tại thành sheet riêng (không sợ mất dữ liệu cũ).\n" +
    "2. Reset điểm về 0 và đưa trạng thái về CHƯA NỘP cho cả lớp.\n" +
    "3. Giữ nguyên cột Hệ Số Bầu (trọng số) của Thầy.\n\n" +
    "Thầy có muốn tiếp tục?",
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) return;

  const sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
  const sheetLog = ss.getSheetByName(SHEET_LOG);

  if (!sheetDash) {
    ui.alert("Lỗi: Không tìm thấy sheet DASHBOARD! Vui lòng chạy hàm khởi tạo trước.");
    return;
  }

  const timeStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd-MM_HHhmm");

  // 1. Sao lưu Sheet DASHBOARD
  const backupDash = sheetDash.copyTo(ss);
  backupDash.setName("LuuTru_DASHBOARD_" + timeStr);

  // 2. Sao lưu Sheet NHAT_KY_VA_GOP_Y (nếu có dữ liệu)
  if (sheetLog && sheetLog.getLastRow() > 1) {
    const backupLog = sheetLog.copyTo(ss);
    backupLog.setName("LuuTru_NHATKY_" + timeStr);
    
    // Xóa nhật ký đợt cũ trong sheetLog chính
    sheetLog.deleteRows(2, sheetLog.getLastRow() - 1);
  }

  // 3. Reset các cột C, D, E trên Dashboard chính (Giữ nguyên Cột F - Hệ số)
  const numRows = DANH_SACH_10B5.length;
  const statusValues = [];
  const pointsValues = [];
  const timeValues = [];

  for (let i = 0; i < numRows; i++) {
    statusValues.push(["⏳ CHƯA NỘP"]);
    pointsValues.push([0]);
    timeValues.push([""]);
  }

  sheetDash.getRange(12, 3, numRows, 1).setValues(statusValues);
  sheetDash.getRange(12, 4, numRows, 1).setValues(pointsValues);
  sheetDash.getRange(12, 5, numRows, 1).setValues(timeValues);

  // Cập nhật mã đợt mới tự động ở F3 và Script Properties
  const newRound = "Dot_" + Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "ddMMyyyy_HHmmss");
  sheetDash.getRange("F3").setValue(newRound);
  PropertiesService.getScriptProperties().setProperty("CURRENT_ROUND_ID", newRound);

  SpreadsheetApp.flush();

  ui.alert("ĐÃ HOÀN TẤT!", `Đã sao lưu kết quả sang sheet: "LuuTru_DASHBOARD_${timeStr}", cập nhật mã đợt mới: "${newRound}" và reset bảng thành công! Học sinh có thể bắt đầu bình chọn đợt mới.`, ui.ButtonSet.OK);
}

/**
 * HÀM 3: TIẾP NHẬN PHIẾU BÌNH CHỌN & GÓP Ý TỪ WEB APP (doPost)
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

    if (!sheetDash || !sheetLog) {
      khoiTaoDashboard();
      sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
      sheetLog = ss.getSheetByName(SHEET_LOG);
    }

    // Lấy dữ liệu 46 học sinh từ hàng 12 đến hàng 57 (Cột A đến G: 7 cột)
    const dataRange = sheetDash.getRange(12, 1, 46, 7);
    const values = dataRange.getValues();

    // TỰ ĐỘNG NHẬN DIỆN ĐỢT BÌNH CHỌN MỚI TỪ CLI/WEB APP HOẶC TỪ Ô F3 TRÊN SHEET
    const scriptProps = PropertiesService.getScriptProperties();
    const currentRound = scriptProps.getProperty("CURRENT_ROUND_ID") || "";
    const incomingRound = (data.roundId || "").trim();

    // Kiểm tra cấu hình Round ID trên ô F3 của sheetDash
    let sheetRound = "";
    try {
      sheetRound = String(sheetDash.getRange("F3").getValue() || "").trim();
    } catch(e) {}

    const activeRound = sheetRound || incomingRound;

    if (activeRound && activeRound !== currentRound) {
      // Nếu phát hiện mã đợt mới từ Web/CLI hoặc đổi trên Sheet, tự động sao lưu bảng cũ và reset điểm cho đợt mới
      const timeStr = Utilities.formatDate(new Date(), "Asia/Ho_Chi_Minh", "dd-MM_HHhmm");
      try {
        const backupDash = sheetDash.copyTo(ss);
        backupDash.setName("LuuTru_" + (currentRound ? currentRound : "DotCu") + "_" + timeStr);
      } catch (backupErr) {
        // Bỏ qua nếu trùng tên sheet sao lưu
      }

      // Reset các cột C (Trạng thái), D (Điểm), E (Thời gian). GIỮ NGUYÊN CỘT F (Trọng số)
      for (let i = 0; i < values.length; i++) {
        values[i][2] = "⏳ CHƯA NỘP";
        values[i][3] = 0;
        values[i][4] = "";
      }
      scriptProps.setProperty("CURRENT_ROUND_ID", activeRound);
      if (!sheetRound && incomingRound) {
        sheetDash.getRange("F3").setValue(incomingRound);
      }
    }

    // 1. Tìm voter, kiểm tra xem đã nộp chưa, lấy trọng số (Cột F - index 5)
    let voterFound = false;
    let voterWeight = 1;
    for (let i = 0; i < values.length; i++) {
      if (values[i][1] === voter) {
        voterFound = true;

        // KIỂM TRA CHỐNG VOTE NHIỀU LẦN: Nếu đã nộp trước đó trong cùng đợt thì từ chối ngay lập tức
        const currentStatus = String(values[i][2] || "");
        if (currentStatus.indexOf("Đã nộp") !== -1) {
          return ContentService.createTextOutput(JSON.stringify({
            status: "already_voted",
            message: `Học sinh "${voter}" đã nộp phiếu bình chọn ở đợt này rồi! Mỗi bạn chỉ được gửi 1 lần.`
          })).setMimeType(ContentService.MimeType.JSON);
        }

        values[i][2] = "✅ Đã nộp phiếu";
        values[i][4] = timestamp;
        
        // Đọc trọng số an toàn (hỗ trợ cả dấu phẩy 1,5 hoặc dấu chấm 1.5)
        const rawWeight = String(values[i][5] || "").replace(',', '.').trim();
        const w = parseFloat(rawWeight);
        if (!isNaN(w) && w > 0) {
          voterWeight = w;
        }
        break;
      }
    }

    if (!voterFound) {
      return ContentService.createTextOutput(JSON.stringify({ 
        status: "error", 
        message: `Không tìm thấy học sinh "${voter}" trong danh sách lớp 10B5!` 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // 2. Ghi nhật ký vào Sheet NHAT_KY_VA_GOP_Y (Kèm hệ số phiếu)
    sheetLog.appendRow([timestamp, voter, voterWeight, selected.join(", "), feedback]);

    // 3. Tăng điểm cho các bạn được chọn theo Hệ Số Trọng Số của voter
    for (let targetName of selected) {
      for (let i = 0; i < values.length; i++) {
        if (values[i][1] === targetName) {
          const currentPoints = parseFloat(String(values[i][3] || 0).replace(',', '.')) || 0;
          values[i][3] = currentPoints + voterWeight;
          break;
        }
      }
    }

    // 4. Ghi ngược lại Dashboard
    dataRange.setValues(values);
    SpreadsheetApp.flush();

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Recorded successfully", weight: voterWeight, roundId: incomingRound }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * HÀM 4: KIỂM TRA TRẠNG THÁI WEB & HỌC SINH ĐÃ VOTE CHƯA (doGet)
 */
function doGet(e) {
  try {
    const action = e && e.parameter ? e.parameter.action : "";
    const voter = e && e.parameter ? (e.parameter.voter || "").trim() : "";
    const reqRound = e && e.parameter ? (e.parameter.round || "").trim() : "";

    // LẤY CẤU HÌNH ĐỘNG TỪ GOOGLE SHEET (Tiêu đề, Đợt bình chọn)
    if (action === "getConfig") {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
      let appTitle = "";
      let roundId = "";
      if (sheetDash) {
        appTitle = String(sheetDash.getRange("B3").getValue() || "").trim();
        roundId = String(sheetDash.getRange("F3").getValue() || "").trim();
      }
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        appTitle: appTitle,
        roundId: roundId
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Kiểm tra trạng thái nộp phiếu của 1 học sinh cụ thể
    if (action === "check" && voter) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetDash = ss.getSheetByName(SHEET_DASHBOARD);
      
      if (!sheetDash) {
        return ContentService.createTextOutput(JSON.stringify({ status: "success", voter: voter, hasVoted: false }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Kiểm tra xem đợt yêu cầu có khác đợt hiện tại trên Sheet không
      const scriptProps = PropertiesService.getScriptProperties();
      const currentRound = scriptProps.getProperty("CURRENT_ROUND_ID") || "";
      if (reqRound && currentRound && reqRound !== currentRound) {
        // Đợt mới hoàn toàn -> chắc chắn học sinh chưa nộp cho đợt mới
        return ContentService.createTextOutput(JSON.stringify({ 
          status: "success", 
          voter: voter, 
          hasVoted: false,
          isNewRound: true 
        })).setMimeType(ContentService.MimeType.JSON);
      }

      const values = sheetDash.getRange(12, 1, 46, 3).getValues();
      let hasVoted = false;
      for (let i = 0; i < values.length; i++) {
        if (values[i][1] === voter) {
          const status = String(values[i][2] || "");
          if (status.indexOf("Đã nộp") !== -1) {
            hasVoted = true;
          }
          break;
        }
      }

      return ContentService.createTextOutput(JSON.stringify({ 
        status: "success", 
        voter: voter, 
        hasVoted: hasVoted 
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput("Hệ thống Google Apps Script cho Lớp 10B5 đang hoạt động bình thường 24/7.")
      .setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
