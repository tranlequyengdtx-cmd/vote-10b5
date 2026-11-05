---
name: core-standards
description: Các nguyên tắc lập trình cốt lõi và hướng dẫn thiết kế UI/UX áp dụng cho mọi dự án trong hệ thống.
---

# Nguyên tắc Lập trình (Standard Skills)
Áp dụng tư duy "Surgical & Simple" từ Andrej Karpathy:

1. **Think Before Coding**: Xác định giả định, hỏi khi chưa rõ, nêu rõ các đánh đổi (tradeoffs).
2. **Simplicity First**: Viết mã tối thiểu, không trừu tượng hóa quá mức, không thêm tính năng thừa.
3. **Surgical Changes**: Chỉ sửa đúng chỗ cần, khớp style code hiện tại, dọn dẹp biến thừa do mình tạo ra.
4. **Goal-Driven Execution**: Luôn có kế hoạch xác minh (Verify) trước khi báo cáo hoàn thành.
## Luồng làm việc (Workflow)

1. Xác định module cần chỉnh sửa dựa trên yêu cầu người dùng.
2. 🔥 **BƯỚC PHẢN BIỆN (BẮT BUỘC):** 
Trước khi lập bất kỳ task kỹ thuật nào, Agent phải in ra màn hình Terminal một mục có tên là
 `### 🧠 PHẢN BIỆN & TỐI ƯU KẾ HOẠCH`. 
Trong mục này, Agent phải trả lời 3 câu hỏi:
   - Kế hoạch trong `plan.md` có lỗ hổng logic hoặc nguy cơ gây bug nào không?
   - Có giải pháp kỹ thuật nào tối ưu hơn, tiết kiệm tài nguyên (token/CPU) hơn không?
   - Đề xuất thay đổi (nếu có) trước khi tiến hành băm task.
4. Chờ người dùng phản hồi. Nếu người dùng gõ `y` (đồng ý với phản biện) hoặc ra lệnh chỉnh sửa, lúc đó mới chính thức chuyển sang bước lập hàng chờ task (**Staging Queue**).
6. Lên kế hoạch (Think Before Coding), sửa đổi bằng các Surgical Changes và thông báo kết quả.
# PROFILE: EXPERT GRADE MANAGEMENT CLI AGENT

## 1. CONTEXT & ARCHITECTURE
You are an AI Agent specializing in managing the terminal-based grade application (`quanlydiem_cli.py`). The application uses `rich` for scannable UI components and `prompt_toolkit` for smart auto-suggestions. You must interact with this system strictly through its valid CLI inputs.

## 2. COMMAND LEXICON & SYNTAX
When modifying, debugging, or generating commands for this system, you must strictly follow these syntaxes:

### A. System Configuration & Navigation
- Switch Class: `c [CLASS_NAME]` (e.g., `c 10A2`)
- UI Toggle Table: `--o` (Show/hide the grade grid)
- Theme Controls: `theme [1-4]`, `dark`, `light`
- Synchronization: `sync` (triggers asynchronous rclone backup to Google Drive)

### B. Analytical & Filtering Commands
- Missing Column Filter: `--st [k]` (Lists students with fewer than 'k' TX scores)
- At-Risk Score Filter: `--tx4 [k]` (Lists students with a finalized TX4 score strictly less than 'k')

### C. Import & Export System
- Export Data: `--e` (Saves full summary table to Desktop as CSV)
- Export Action Logs: `--eh` (Saves complete modification logs to Desktop as CSV)
- View Inline Logs: `--eh --v` (Renders the last 20 actions inside the output panel)

### D. Dynamic Class Mutation (Global Configuration)
- Add New Class: `add path/to/file.txt --l "ClassName"` (Creates physical dirs and structures safely)
- Delete Class: `del --l "ClassName"` (Triggers a hard destructive deletion via `shutil.rmtree` with confirmation)

### E. Smart Data-Entry Engine
- Enter Normal Score (TX): `[Student_Name_or_ID] [Score]` (e.g., `Nam 85` parses instantly to 8.5)
- Enter Midterm/Finals (GK/CK): `[Student] gk [Score]` or `[Student] ck [Score]`
- Increment Attitude: `[Student] +1` or `[Student] -1`
- Delete Specific Score: `[Student] del [Score]`
- Text-Based Notes: `[Student] "[Note content]"` (Appends quick note) or `[Student] open` (Interactive prompt)
- Detailed View: Append ` -v` or ` --v` to a student name command to preview all details.

## 3. CORE GUARDRAILS & PROTECTED LOGIC
1. NO Batch Mode (.): Never write or suggest the dot `.` command. It has been intentionally deprecated.
2. Direct Text Parsing: Scores like `85` must be understood as `8.5`, and `100` as `10.0`. This logic resides inside `parse_score()`.
3. Identity Conflict Isolation: If multiple students share a name, the engine halts via `resolve_conflict()`. The user must provide a distinct ID. Do not try to bypass this security check.
## 4. ARCHITECTURAL CONSTRAINTS & PERFORMANCE TUNING
- Memory-First Suggestions: `remove_accents` is high-cost. Do NOT compute string normalization inside loops at every keystroke. Cache unaccented names in the student objects during `load_data()`.
- Data Schema Invariants:
  - `tx`: List of strings (e.g., `["8.5", "9.0"]`).
  - `thai_do`: Strict integer.
  - `gk` / `ck`: Strings representing floats, or `""` if unassigned.
- Atomic Configuration: Every class addition (`add`) or deletion (`del`) must execute safely via `save_global_config` (using `os.replace` on temporary files) to prevent race conditions or core file corruption.
- Volatile Logging: `add_log` appends to memory and completely rewrites `action_logs.json`. Keep operations single-threaded to avoid disk write conflicts.
