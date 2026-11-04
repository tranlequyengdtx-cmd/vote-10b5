#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Admin CLI Utility for Class Voting App
Quản lý tiêu chí, tra cứu kết quả bình chọn và xem phản hồi học sinh.
"""

import os
import sys
import sqlite3
import argparse
import datetime
import shutil

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "votes.db")

IS_TTY = sys.stdout.isatty()

# ANSI Color helpers
def c_bold(text):
    return f"\033[1m{text}\033[0m" if IS_TTY else str(text)

def c_blue(text):
    return f"\033[1;34m{text}\033[0m" if IS_TTY else str(text)

def c_green(text):
    return f"\033[1;32m{text}\033[0m" if IS_TTY else str(text)

def c_yellow(text):
    return f"\033[1;33m{text}\033[0m" if IS_TTY else str(text)

def c_red(text):
    return f"\033[1;31m{text}\033[0m" if IS_TTY else str(text)

def c_cyan(text):
    return f"\033[1;36m{text}\033[0m" if IS_TTY else str(text)


def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                student_name TEXT PRIMARY KEY,
                password_hash TEXT,
                created INTEGER
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS criteria (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                voter TEXT NOT NULL,
                target TEXT NOT NULL,
                criteria_id INTEGER NOT NULL,
                UNIQUE(voter, target, criteria_id)
            )
        """)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                student_name TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()


def add_criterion(title):
    title = title.strip()
    if not title:
        print(c_red("❌ Tiêu chí không được để trống!"))
        return
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO criteria (title) VALUES (?)", (title,))
        conn.commit()
        new_id = cursor.lastrowid
        print(c_green(f"✅ Đã thêm tiêu chí mới [ID: {new_id}]: ") + c_bold(title))


def list_criteria():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title FROM criteria ORDER BY id ASC")
        rows = cursor.fetchall()
        if not rows:
            print(c_yellow("⚠️ Chưa có tiêu chí bình chọn nào trong hệ thống."))
            print("Dùng: python admin.py --add-crit \"<Tên tiêu chí>\" để tạo mới.")
            return

        print(c_cyan("\n📋 DANH SÁCH TIÊU CHÍ BÌNH CHỌN:"))
        print("─" * 60)
        print(f" {'ID':<6} │ {'Tên tiêu chí'}")
        print("─" * 60)
        for cid, title in rows:
            print(f" {c_bold(str(cid)):<6} │ {title}")
        print("─" * 60 + "\n")


def del_criterion(crit_id):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT title FROM criteria WHERE id = ?", (crit_id,))
        row = cursor.fetchone()
        if not row:
            print(c_red(f"❌ Không tìm thấy tiêu chí với ID {crit_id}."))
            return
        title = row[0]
        cursor.execute("DELETE FROM votes WHERE criteria_id = ?", (crit_id,))
        cursor.execute("DELETE FROM criteria WHERE id = ?", (crit_id,))
        conn.commit()
        print(c_green(f"✅ Đã xóa tiêu chí [{crit_id}] '{title}' và toàn bộ phiếu bình chọn liên quan."))


def show_top_voted(n):
    if n <= 0:
        n = 5
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title FROM criteria ORDER BY id ASC")
        criteria_list = cursor.fetchall()

        if not criteria_list:
            print(c_yellow("⚠️ Chưa có tiêu chí bình chọn nào."))
            return

        term_width = max(60, min(shutil.get_terminal_size().columns, 90))

        print(c_blue("\n" + "═" * term_width))
        print(c_bold(f" 🏆 BẢNG XẾP HẠNG TOP {n} HỌC SINH ĐƯỢC BÌNH CHỌN CAO NHẤT"))
        print(c_blue("═" * term_width))

        for cid, title in criteria_list:
            print(f"\n📌 {c_cyan('Tiêu chí [ID ' + str(cid) + ']:')} {c_bold(title)}")
            
            # Query vote counts
            cursor.execute("""
                SELECT target, COUNT(*) as vote_count
                FROM votes
                WHERE criteria_id = ?
                GROUP BY target
                ORDER BY vote_count DESC, target ASC
                LIMIT ?
            """, (cid, n))
            rankings = cursor.fetchall()

            if not rankings:
                print(f"   {c_yellow('(Chưa có lượt bình chọn nào cho tiêu chí này)')}")
                continue

            print("   ┌──────┬──────────────────────────────┬────────────┐")
            print("   │ Hạng │ Họ và Tên                    │ Số phiếu   │")
            print("   ├──────┼──────────────────────────────┼────────────┤")
            for rank, (target, count) in enumerate(rankings, 1):
                medal = "🥇" if rank == 1 else ("🥈" if rank == 2 else ("🥉" if rank == 3 else f" {rank} "))
                print(f"   │ {medal:<4} │ {target:<28} │ {c_green(str(count) + ' phiếu'):<19} │")
            print("   └──────┴──────────────────────────────┴────────────┘")

        print("\n" + c_blue("═" * term_width) + "\n")


def show_feedback():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT id, student_name, content, created_at
            FROM feedback
            ORDER BY id DESC
        """)
        feedbacks = cursor.fetchall()

        if not feedbacks:
            print(c_yellow("\n💬 Chưa có ý kiến đóng góp nào từ học sinh.\n"))
            return

        term_width = max(60, min(shutil.get_terminal_size().columns, 90))
        print(c_green("\n" + "═" * term_width))
        print(c_bold(f" 💬 DANH SÁCH Ý KIẾN ĐÓNG GÓP TỪ HỌC SINH ({len(feedbacks)} ý kiến)"))
        print(c_green("═" * term_width))

        for fid, student_name, content, created_at in feedbacks:
            # format created_at cleanly
            time_str = str(created_at).split(".")[0] if created_at else ""
            print(f"\n🔹 {c_bold(student_name)} {c_yellow('[' + time_str + ']')} (Mã #{fid}):")
            for line in content.strip().splitlines():
                print(f"   │ {line}")

        print("\n" + c_green("═" * term_width) + "\n")


def show_stats():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        active_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT voter) FROM votes")
        voted_users = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM votes")
        total_votes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM feedback")
        total_feedback = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM criteria")
        total_criteria = cursor.fetchone()[0]

        # Load total students from students.json if available
        students_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), "students.json")
        total_students = 0
        if os.path.exists(students_file):
            import json
            try:
                with open(students_file, "r", encoding="utf-8") as f:
                    s_data = json.load(f)
                    total_students = len(s_data)
            except:
                pass

        print(c_cyan("\n📊 THỐNG KÊ TIẾN ĐỘ BÌNH CHỌN:"))
        print("─" * 45)
        print(f" • Tổng số học sinh trong lớp : {c_bold(str(total_students)) if total_students else 'Chưa rõ'}")
        print(f" • Số học sinh đã tạo mã PIN  : {c_green(str(active_users))}")
        print(f" • Số học sinh đã tham gia vote: {c_green(str(voted_users))}")
        print(f" • Tổng số phiếu đã bầu       : {c_bold(str(total_votes))}")
        print(f" • Số ý kiến đóng góp đã gửi  : {c_bold(str(total_feedback))}")
        print(f" • Số tiêu chí đang mở        : {c_bold(str(total_criteria))}")
        print("─" * 45 + "\n")


def reset_password(student_name):
    student_name = student_name.strip()
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT student_name FROM users WHERE LOWER(student_name) = LOWER(?)", (student_name,))
        row = cursor.fetchone()
        if not row:
            print(c_yellow(f"⚠️ Học sinh '{student_name}' chưa từng đăng nhập hoặc không tồn tại trong hệ thống."))
            return
        actual_name = row[0]
        cursor.execute("DELETE FROM users WHERE student_name = ?", (actual_name,))
        conn.commit()
        print(c_green(f"✅ Đã reset mã PIN cho học sinh: ") + c_bold(actual_name))
        print("Học sinh này có thể tự đặt lại mã PIN mới trong lần đăng nhập tiếp theo.")


def main():
    init_db()

    parser = argparse.ArgumentParser(
        description="Admin CLI Utility cho ứng dụng Bình chọn Lớp học (Vote App)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""Ví dụ sử dụng:
  python admin.py --add-crit "Học sinh gương mẫu tháng 10"
  python admin.py --list-crit
  python admin.py --top 5
  python admin.py --feedback
  python admin.py --stats
  python admin.py --reset-pass "Nguyễn Văn A"
        """
    )
    parser.add_argument("--add-crit", type=str, metavar="TITLE", help="Thêm tiêu chí bình chọn mới")
    parser.add_argument("--list-crit", action="store_true", help="Liệt kê tất cả các tiêu chí hiện có")
    parser.add_argument("--del-crit", type=int, metavar="ID", help="Xóa tiêu chí theo ID kèm phiếu liên quan")
    parser.add_argument("--top", type=int, nargs="?", const=5, metavar="N", help="Hiển thị Top N học sinh được vote nhiều nhất (mặc định: 5)")
    parser.add_argument("--feedback", action="store_true", help="Xem tất cả ý kiến đóng góp của học sinh")
    parser.add_argument("--stats", action="store_true", help="Xem tổng quan thống kê số liệu bình chọn")
    parser.add_argument("--reset-pass", type=str, metavar="NAME", help="Reset mã PIN/mật khẩu cho một học sinh")

    if len(sys.argv) == 1:
        parser.print_help()
        sys.exit(0)

    args = parser.parse_args()

    if args.add_crit:
        add_criterion(args.add_crit)
    if args.del_crit is not None:
        del_criterion(args.del_crit)
    if args.list_crit:
        list_criteria()
    if args.top is not None:
        show_top_voted(args.top)
    if args.feedback:
        show_feedback()
    if args.stats:
        show_stats()
    if args.reset_pass:
        reset_password(args.reset_pass)


if __name__ == "__main__":
    main()
