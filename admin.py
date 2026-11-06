#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Class Voting App - Admin CLI Management Tool
Quản trị đợt bình chọn, tiêu đề và nề nếp lớp 10B5 qua dòng lệnh.
Hỗ trợ can thiệp nhanh, tự động reset khóa đợt cho học sinh và đồng bộ GitHub Pages.
"""

import os
import re
import sys
import json
import argparse
import datetime
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(SCRIPT_DIR, "poll_config.js")
INDEX_FILE = os.path.join(SCRIPT_DIR, "index.html")

IS_TTY = sys.stdout.isatty()

# Helper màu sắc terminal
def c_bold(s): return f"\033[1m{s}\033[0m" if IS_TTY else str(s)
def c_green(s): return f"\033[1;32m{s}\033[0m" if IS_TTY else str(s)
def c_cyan(s): return f"\033[1;36m{s}\033[0m" if IS_TTY else str(s)
def c_yellow(s): return f"\033[1;33m{s}\033[0m" if IS_TTY else str(s)
def c_red(s): return f"\033[1;31m{s}\033[0m" if IS_TTY else str(s)
def c_magenta(s): return f"\033[1;35m{s}\033[0m" if IS_TTY else str(s)


def load_config():
    """Đọc cấu hình từ poll_config.js"""
    if not os.path.exists(CONFIG_FILE):
        return {
            "roundId": generate_default_round_id(),
            "appTitle": "Khảo Sát Nề Nếp Cuối Tuần",
            "appSubtitle": "Bảo mật & Khách quan",
            "promptTitle": "Để xây dựng môi trường học tập tập trung, em hãy chọn các bạn thường xuyên làm ồn / mất trật tự trong tuần để GVCN có biện pháp uốn nắn kịp thời",
            "promptDesc": "Bấm chọn vào tên của các bạn vi phạm nề nếp (có thể chọn nhiều bạn).",
            "feedbackTitle": "Ý Kiến Phản Ánh / Đề Xuất Cho GVCN (Tùy chọn)",
            "feedbackDesc": "Em có phản ánh cụ thể về giờ học nào hoặc đề xuất biện pháp chấn chỉnh nề nếp cho Thầy không?",
            "feedbackPlaceholder": "Nhập nội dung phản ánh hoặc đề xuất riêng tại đây (nếu có)...",
            "submitButtonText": "XÁC NHẬN NỘP PHIẾU PHẢN ÁNH",
            "updatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
        }

    try:
        with open(CONFIG_FILE, "r", encoding="utf-8") as f:
            content = f.read()

        # Trích xuất đối tượng JSON từ const POLL_CONFIG = { ... };
        match = re.search(r"const\s+POLL_CONFIG\s*=\s*(\{[\s\S]*?\});", content)
        if match:
            # Chuyển đổi cú pháp JS object sang json chuẩn
            json_str = match.group(1)
            # Thay thế các comment dòng // nếu có
            json_str = re.sub(r"//.*?\n", "\n", json_str)
            # Thêm dấu ngoặc kép cho keys
            json_str = re.sub(r'(\w+)\s*:', r'"\1":', json_str)
            # Bỏ dấu phẩy cuối dòng trước ngoặc đóng
            json_str = re.sub(r',\s*\}', '}', json_str)
            return json.loads(json_str)
    except Exception:
        pass

    # Fallback regex thủ công an toàn nếu JSON parse gặp lỗi
    config = {}
    with open(CONFIG_FILE, "r", encoding="utf-8") as f:
        text = f.read()
    for key in ["roundId", "appTitle", "appSubtitle", "promptTitle", "promptDesc",
                "feedbackTitle", "feedbackDesc", "feedbackPlaceholder", "submitButtonText", "updatedAt"]:
        m = re.search(rf'{key}\s*:\s*["\'](.*?)["\']', text)
        if m:
            config[key] = m.group(1)
    return config


def save_config(config):
    """Ghi cấu hình ra file poll_config.js"""
    config["updatedAt"] = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    
    js_content = f"""// ==============================================================================
// CẤU HÌNH ĐỢT BÌNH CHỌN & TIÊU ĐỀ ỨNG DỤNG LỚP 10B5
// File này được quản lý tự động bởi CLI (admin.py) hoặc có thể sửa trực tiếp.
// ==============================================================================
const POLL_CONFIG = {{
    // Mã đợt bình chọn. Khi thay đổi mã này, học sinh cả lớp sẽ được mở khóa
    // để bình chọn đợt mới mà không bị chặn bởi bộ nhớ trình duyệt cũ.
    roundId: "{config.get('roundId', '')}",

    // Tiêu đề và mô tả ở Màn hình 1 (Đăng nhập)
    appTitle: "{config.get('appTitle', '')}",
    appSubtitle: "{config.get('appSubtitle', '')}",

    // Lời nhắc và hướng dẫn ở Màn hình 2 (Bình chọn)
    promptTitle: "{config.get('promptTitle', '')}",
    promptDesc: "{config.get('promptDesc', '')}",

    // Tiêu đề & mô tả phần phản ánh riêng
    feedbackTitle: "{config.get('feedbackTitle', '')}",
    feedbackDesc: "{config.get('feedbackDesc', '')}",
    feedbackPlaceholder: "{config.get('feedbackPlaceholder', '')}",

    // Chữ hiển thị trên nút nộp
    submitButtonText: "{config.get('submitButtonText', '')}",

    // Thời gian cập nhật
    updatedAt: "{config.get('updatedAt', '')}"
}};

// Xuất ra môi trường Node.js (nếu dùng kiểm thử)
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = POLL_CONFIG;
}}
"""
    with open(CONFIG_FILE, "w", encoding="utf-8") as f:
        f.write(js_content)
    print(c_green(f"✅ Đã lưu cấu hình vào: {CONFIG_FILE}"))

    # Đồng bộ trực tiếp vào index.html để hiển thị tức thì và phá cache trình duyệt
    sync_index_html(config)


def sync_index_html(config):
    """Đồng bộ trực tiếp tiêu đề, câu hỏi và cache-busting vào index.html"""
    if not os.path.exists(INDEX_FILE):
        return
    try:
        with open(INDEX_FILE, "r", encoding="utf-8") as f:
            html = f.read()

        title = config.get("appTitle", "")
        prompt = config.get("promptTitle", "")
        now_ts = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

        # Cập nhật <title> và <h1 id="app-title">
        if title:
            html = re.sub(r"<title>.*?</title>", f"<title>{title} - Lớp 10B5</title>", html)
            html = re.sub(r'<h1 id="app-title">.*?</h1>', f'<h1 id="app-title">{title}</h1>', html)

        # Cập nhật <h2 id="prompt-title">
        if prompt:
            html = re.sub(r'<h2 id="prompt-title">.*?</h2>', f'<h2 id="prompt-title">{prompt}</h2>', html)

        # Cache busting timestamp cho các file script để ép trình duyệt luôn tải file mới nhất
        html = re.sub(r'src="poll_config\.js(\?v=[^"]*)?"', f'src="poll_config.js?v={now_ts}"', html)
        html = re.sub(r'src="app\.js(\?v=[^"]*)?"', f'src="app.js?v={now_ts}"', html)

        with open(INDEX_FILE, "w", encoding="utf-8") as f:
            f.write(html)
        print(c_green(f"✅ Đã đồng bộ trực tiếp tiêu đề mới & chống cache vào: {INDEX_FILE}"))
    except Exception as e:
        print(c_yellow(f"⚠️ Không thể đồng bộ index.html: {e}"))


def generate_default_round_id():
    """Tự động sinh mã đợt mới theo Tuần và Năm hiện tại"""
    now = datetime.datetime.now()
    week_num = now.isocalendar()[1]
    return f"Tuan_{week_num}_{now.year}_{now.strftime('%d%m')}"


def print_status(config=None):
    """In trạng thái cấu hình hiện tại"""
    if config is None:
        config = load_config()

    print("\n" + c_cyan("═" * 68))
    print(c_bold(" 📊 TRẠNG THÁI CẤU HÌNH ĐỢT BÌNH CHỌN HIỆN TẠI (LỚP 10B5)"))
    print(c_cyan("═" * 68))
    print(f" • {c_bold('Mã Đợt (Round ID)'):<26}: {c_green(config.get('roundId', 'Chưa đặt'))}")
    print(f" • {c_bold('Cập nhật lần cuối'):<26}: {config.get('updatedAt', 'N/A')}")
    print(f" • {c_bold('Tiêu đề App'):<26}: {c_yellow(config.get('appTitle', ''))}")
    print(f" • {c_bold('Phụ đề App'):<26}: {config.get('appSubtitle', '')}")
    print(f" • {c_bold('Lời nhắc câu hỏi'):<26}: {c_magenta(config.get('promptTitle', ''))}")
    print(f" • {c_bold('Mục ý kiến riêng'):<26}: {config.get('feedbackTitle', '')}")
    print(c_cyan("─" * 68))
    print(f" 💡 {c_bold('Cơ chế mở khóa:')} Học sinh trên mọi thiết bị được phân biệt theo")
    print(f"    mã đợt '{config.get('roundId')}'. Khi tạo đợt mới, toàn bộ lớp sẽ")
    print("    tự động được mở khóa nộp phiếu!")
    print(c_cyan("═" * 68) + "\n")


def git_push_auto():
    """Hỏi và tự động commit/push lên GitHub Pages"""
    try:
        res = subprocess.run(["git", "status", "-s"], cwd=SCRIPT_DIR, capture_output=True, text=True)
        if not res.stdout.strip():
            print(c_yellow("ℹ️ Không có thay đổi nào cần push lên GitHub."))
            return

        print(c_yellow("\n📦 Có thay đổi cấu hình cần đẩy lên GitHub Pages:"))
        for line in res.stdout.strip().split("\n"):
            print(f"   {line}")

        ans = input(c_bold("\nThầy có muốn commit và push ngay lên GitHub Pages không? [Y/n]: ")).strip().lower()
        if ans in ["", "y", "yes"]:
            print("🚀 Đang đẩy dữ liệu lên GitHub...")
            subprocess.run(["git", "add", "."], cwd=SCRIPT_DIR, check=True)
            msg = f"Cập nhật đợt bình chọn: {datetime.datetime.now().strftime('%d/%m/%Y %H:%M')}"
            subprocess.run(["git", "commit", "-m", msg], cwd=SCRIPT_DIR, check=True)
            subprocess.run(["git", "push", "origin", "main"], cwd=SCRIPT_DIR, check=True)
            print(c_green("🎉 ĐÃ PUSH THÀNH CÔNG LÊN GITHUB!"))
            print(c_cyan("👉 GitHub Pages sẽ cập nhật sau khoảng 30 giây."))
        else:
            print(c_yellow("Đã hủy push. Thầy có thể push thủ công sau bằng lệnh: python admin.py --push"))
    except Exception as e:
        print(c_red(f"❌ Lỗi khi push git: {e}"))


def interactive_menu():
    """Giao diện menu tương tác dòng lệnh"""
    while True:
        config = load_config()
        print("\n" + c_blue("╔" + "═" * 66 + "╗"))
        print(c_blue("║") + c_bold(" 🛠️  HỆ THỐNG QUẢN TRỊ BÌNH CHỌN & NỀ NẾP LỚP 10B5 (CLI)       ") + c_blue("║"))
        print(c_blue("╚" + "═" * 66 + "╝"))
        print(f" Đợt hiện tại: {c_green(config.get('roundId', ''))} | Cập nhật: {config.get('updatedAt', '')}")
        print(f" Tiêu đề     : {c_yellow(config.get('appTitle', ''))}")
        print("─" * 68)
        print(f" {c_bold('[1]')} 🔄 Bắt đầu ĐỢT BÌNH CHỌN MỚI (Tự động mở khóa cả lớp)")
        print(f" {c_bold('[2]')} ✏️  Chỉnh sửa Tiêu đề App & Lời nhắc câu hỏi")
        print(f" {c_bold('[3]')} 📊 Xem chi tiết cấu hình hiện tại")
        print(f" {c_bold('[4]')} 🚀 Đẩy ngay cấu hình lên GitHub Pages (Git push)")
        print(f" {c_bold('[0]')} ❌ Thoát")
        print("─" * 68)

        choice = input(c_bold("Chọn chức năng (0-4): ")).strip()

        if choice == "1":
            default_round = generate_default_round_id()
            print(f"\n🔄 {c_bold('BẮT ĐẦU ĐỢT BÌNH CHỌN MỚI')}")
            print(f"Gợi ý mã đợt mới: {c_green(default_round)}")
            new_round = input(f"Nhập mã đợt mới (Bấm Enter để dùng '{default_round}'): ").strip()
            if not new_round:
                new_round = default_round

            print(f"\nTiêu đề app hiện tại: {c_yellow(config.get('appTitle', ''))}")
            new_title = input("Tiêu đề mới (Bấm Enter để giữ nguyên): ").strip()

            print(f"\nLời nhắc hiện tại: {c_magenta(config.get('promptTitle', ''))}")
            new_prompt = input("Lời nhắc mới (Bấm Enter để giữ nguyên): ").strip()

            config["roundId"] = new_round
            if new_title:
                config["appTitle"] = new_title
            if new_prompt:
                config["promptTitle"] = new_prompt

            save_config(config)
            print(c_green(f"\n🎉 ĐÃ KHỞI TẠO ĐỢT MỚI THÀNH CÔNG: {new_round}"))
            print(c_cyan("👉 Học sinh cả lớp đã được mở khóa tự động trên điện thoại!"))
            git_push_auto()

        elif choice == "2":
            print(f"\n✏️  {c_bold('CHỈNH SỬA TIÊU ĐỀ & LỜI NHẮC (GIỮ NGUYÊN ĐỢT HIỆN TẠI)')}")
            print(f"1. Tiêu đề App hiện tại: {c_yellow(config.get('appTitle', ''))}")
            new_title = input("   Nhập tiêu đề mới (Enter để giữ nguyên): ").strip()
            if new_title:
                config["appTitle"] = new_title

            print(f"2. Phụ đề App hiện tại: {config.get('appSubtitle', '')}")
            new_sub = input("   Nhập phụ đề mới (Enter để giữ nguyên): ").strip()
            if new_sub:
                config["appSubtitle"] = new_sub

            print(f"3. Lời nhắc hiện tại: {c_magenta(config.get('promptTitle', ''))}")
            new_prompt = input("   Nhập lời nhắc mới (Enter để giữ nguyên): ").strip()
            if new_prompt:
                config["promptTitle"] = new_prompt

            print(f"4. Mô tả lời nhắc hiện tại: {config.get('promptDesc', '')}")
            new_pdesc = input("   Nhập mô tả lời nhắc mới (Enter để giữ nguyên): ").strip()
            if new_pdesc:
                config["promptDesc"] = new_pdesc

            save_config(config)
            print(c_green("✅ Đã cập nhật tiêu đề & lời nhắc thành công!"))
            git_push_auto()

        elif choice == "3":
            print_status(config)
            input(c_bold("Bấm Enter để quay lại menu..."))

        elif choice == "4":
            git_push_auto()
            input(c_bold("Bấm Enter để quay lại menu..."))

        elif choice == "0":
            print("Tạm biệt Thầy!")
            break
        else:
            print(c_red("Lựa chọn không hợp lệ, vui lòng chọn từ 0 đến 4."))


def main():
    parser = argparse.ArgumentParser(
        description="Class Voting App - Admin CLI Utility (Quản lý đợt bình chọn & tiêu đề lớp 10B5)"
    )
    parser.add_argument("--status", "-s", action="store_true", help="Hiển thị trạng thái cấu hình đợt hiện tại")
    parser.add_argument("--new-round", "-n", nargs="?", const="", help="Bắt đầu đợt mới (mở khóa cả lớp). Tùy chọn truyền [MÃ_ĐỢT]")
    parser.add_argument("--reset", "-r", action="store_true", help="Reset đợt mới ngay lập tức với mã tự động sinh")
    parser.add_argument("--title", "-t", type=str, help="Cập nhật tiêu đề App")
    parser.add_argument("--prompt", "-p", type=str, help="Cập nhật câu hỏi / lời nhắc bình chọn")
    parser.add_argument("--push", action="store_true", help="Đẩy cấu hình mới lên GitHub Pages ngay")
    parser.add_argument("--interactive", "-i", action="store_true", help="Mở menu tương tác đầy đủ")

    args = parser.parse_args()

    # Nếu không có cờ lệnh nào được truyền, mở menu tương tác
    if len(sys.argv) == 1 or args.interactive:
        interactive_menu()
        return

    config = load_config()
    changed = False

    if args.status:
        print_status(config)
        return

    # Bắt đầu đợt mới hoặc reset
    if args.new_round is not None or args.reset:
        if args.new_round:
            new_id = args.new_round.strip()
        else:
            new_id = generate_default_round_id()
        config["roundId"] = new_id
        print(c_green(f"🔄 ĐÃ BẮT ĐẦU ĐỢT BÌNH CHỌN MỚI: {c_bold(new_id)}"))
        print(c_cyan("👉 Học sinh cả lớp đã được mở khóa tự động trên mọi thiết bị!"))
        changed = True

    if args.title:
        config["appTitle"] = args.title.strip()
        print(c_green(f"✅ Đã đổi tiêu đề app thành: {config['appTitle']}"))
        changed = True

    if args.prompt:
        config["promptTitle"] = args.prompt.strip()
        print(c_green(f"✅ Đã đổi lời nhắc câu hỏi thành: {config['promptTitle']}"))
        changed = True

    if changed:
        save_config(config)
        print_status(config)

    if args.push or changed:
        git_push_auto()


if __name__ == "__main__":
    main()
