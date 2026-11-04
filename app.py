#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Class Voting & Feedback Web Application
Hệ thống Bình chọn Lớp học & Cổng Quản trị dành cho Giáo viên.
Hỗ trợ chạy cục bộ hoặc triển khai Streamlit Cloud.
"""

import os
import io
import csv
import json
import time
import hashlib
import sqlite3
import datetime
import streamlit as st

# Đường dẫn file dữ liệu
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DB_FILE = os.path.join(CURRENT_DIR, "votes.db")
STUDENTS_FILE = os.path.join(CURRENT_DIR, "students.json")
SALT = "_vote_app_salt_2026"

# Mật khẩu quản trị mặc định (Có thể tùy biến qua Streamlit Secrets nếu cần)
DEFAULT_ADMIN_PIN = "123456"

# Cấu hình giao diện Streamlit
st.set_page_config(
    page_title="Bình chọn Lớp học 10B5",
    page_icon="🗳️",
    layout="centered",
    initial_sidebar_state="expanded"
)


# --- QUẢN LÝ DATABASE VÀ SECURITY ---
def get_db():
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
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


def hash_password(password: str) -> str:
    return hashlib.sha256((password.strip() + SALT).encode("utf-8")).hexdigest()


def load_students():
    if not os.path.exists(STUDENTS_FILE):
        return []
    try:
        with open(STUDENTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        st.error(f"Lỗi đọc danh sách học sinh: {e}")
        return []


def is_user_registered(student_name: str) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE student_name = ?", (student_name,))
        row = cursor.fetchone()
        return row is not None


def verify_user_password(student_name: str, password: str) -> bool:
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT password_hash FROM users WHERE student_name = ?", (student_name,))
        row = cursor.fetchone()
        if not row:
            return False
        return row[0] == hash_password(password)


def register_user(student_name: str, password: str):
    p_hash = hash_password(password)
    now_ts = int(time.time())
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            INSERT OR REPLACE INTO users (student_name, password_hash, created)
            VALUES (?, ?, ?)
        """, (student_name, p_hash, now_ts))
        conn.commit()


def get_active_criteria():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, title FROM criteria ORDER BY id ASC")
        return cursor.fetchall()


def add_criterion_db(title: str):
    title = title.strip()
    if not title:
        return False
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO criteria (title) VALUES (?)", (title,))
        conn.commit()
    return True


def delete_criterion_db(criterion_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM votes WHERE criteria_id = ?", (criterion_id,))
        cursor.execute("DELETE FROM criteria WHERE id = ?", (criterion_id,))
        conn.commit()


def reset_student_pin_db(student_name: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM users WHERE student_name = ?", (student_name,))
        conn.commit()


def get_student_votes(student_name: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT criteria_id, target FROM votes WHERE voter = ?", (student_name,))
        rows = cursor.fetchall()
        votes_map = {}
        for cid, target in rows:
            votes_map.setdefault(cid, []).append(target)
        return votes_map


def save_student_votes(student_name: str, votes_dict: dict):
    with get_db() as conn:
        cursor = conn.cursor()
        for cid, targets in votes_dict.items():
            cursor.execute("DELETE FROM votes WHERE voter = ? AND criteria_id = ?", (student_name, cid))
            for target in targets:
                cursor.execute("""
                    INSERT OR IGNORE INTO votes (voter, target, criteria_id)
                    VALUES (?, ?, ?)
                """, (student_name, target, cid))
        conn.commit()


def save_student_feedback(student_name: str, content: str):
    content = content.strip()
    if not content:
        return False
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("INSERT INTO feedback (student_name, content) VALUES (?, ?)", (student_name, content))
        conn.commit()
    return True


def get_student_previous_feedback(student_name: str):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT content, created_at FROM feedback 
            WHERE student_name = ? 
            ORDER BY id DESC LIMIT 5
        """, (student_name,))
        return cursor.fetchall()


def get_all_feedback_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, student_name, content, created_at FROM feedback ORDER BY id DESC")
        return cursor.fetchall()


def get_criteria_rankings_db(cid: int, limit: int = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if limit:
            cursor.execute("""
                SELECT target, COUNT(*) as vote_count
                FROM votes
                WHERE criteria_id = ?
                GROUP BY target
                ORDER BY vote_count DESC, target ASC
                LIMIT ?
            """, (cid, limit))
        else:
            cursor.execute("""
                SELECT target, COUNT(*) as vote_count
                FROM votes
                WHERE criteria_id = ?
                GROUP BY target
                ORDER BY vote_count DESC, target ASC
            """, (cid,))
        return cursor.fetchall()


def get_system_stats_db():
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        active_users = cursor.fetchone()[0]

        cursor.execute("SELECT DISTINCT voter FROM votes")
        voters = [row[0] for row in cursor.fetchall()]

        cursor.execute("SELECT COUNT(*) FROM votes")
        total_votes = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM feedback")
        total_feedback = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM criteria")
        total_criteria = cursor.fetchone()[0]

        return {
            "active_users": active_users,
            "voters": voters,
            "total_votes": total_votes,
            "total_feedback": total_feedback,
            "total_criteria": total_criteria
        }


# --- KHỞI TẠO DỮ LIỆU ---
init_db()
students_data = load_students()
student_names = [s["name"] for s in students_data]

if "logged_in_user" not in st.session_state:
    st.session_state["logged_in_user"] = None

if "is_admin_logged_in" not in st.session_state:
    st.session_state["is_admin_logged_in"] = False


# ==============================================================================
# GIAO DIỆN QUẢN TRỊ DÀNH CHO GIÁO VIÊN
# ==============================================================================
def show_admin_portal():
    st.title("🔒 Cổng Quản Trị Viên (Giáo Viên)")
    st.caption("Quản lý đợt bình chọn, tra cứu kết quả và đọc phản hồi học sinh theo thời gian thực")

    tab_rankings, tab_feedback_admin, tab_criteria_admin, tab_progress, tab_reset = st.tabs([
        "🏆 Bảng Xếp Hạng",
        "💬 Ý Kiến Đóng Góp",
        "📋 Quản Lý Tiêu Chí",
        "📊 Tiến Độ Tham Gia",
        "🔑 Reset Mã PIN"
    ])

    # --- TAB 1: BẢNG XẾP HẠNG BÌNH CHỌN ---
    with tab_rankings:
        criteria_list = get_active_criteria()
        if not criteria_list:
            st.info("Chưa có tiêu chí nào. Vui lòng tạo tiêu chí mới ở tab 'Quản Lý Tiêu Chí'.")
        else:
            top_option = st.selectbox("Xem Top học sinh:", options=[3, 5, 10, "Tất cả"], index=1)
            limit = None if top_option == "Tất cả" else int(top_option)

            all_export_rows = []

            for cid, ctitle in criteria_list:
                st.markdown(f"### 📌 {ctitle}")
                rankings = get_criteria_rankings_db(cid, limit)
                if not rankings:
                    st.write("*(Chưa có lượt bình chọn nào)*")
                else:
                    table_data = []
                    for rank, (target, count) in enumerate(rankings, 1):
                        icon = "🥇" if rank == 1 else ("🥈" if rank == 2 else ("🥉" if rank == 3 else f"#{rank}"))
                        table_data.append({
                            "Hạng": icon,
                            "Họ và Tên": target,
                            "Số phiếu": f"{count} phiếu"
                        })
                        all_export_rows.append({
                            "Tiêu chí": ctitle,
                            "Hạng": rank,
                            "Học sinh": target,
                            "Số phiếu": count
                        })
                    st.table(table_data)
                st.markdown("---")

            # Nút xuất CSV kết quả
            if all_export_rows:
                output = io.StringIO()
                writer = csv.DictWriter(output, fieldnames=["Tiêu chí", "Hạng", "Học sinh", "Số phiếu"])
                writer.writeheader()
                writer.writerows(all_export_rows)
                st.download_button(
                    label="📥 Tải Kết Quả Bình Chọn (File CSV)",
                    data=output.getvalue().encode('utf-8-sig'),
                    file_name=f"KetQua_BinhChon_{datetime.date.today().strftime('%Y%m%d')}.csv",
                    mime="text/csv",
                    use_container_width=True
                )

    # --- TAB 2: Ý KIẾN ĐÓNG GÓP ---
    with tab_feedback_admin:
        feedbacks = get_all_feedback_db()
        st.write(f"Tổng số ý kiến đã nhận: **{len(feedbacks)}**")

        if not feedbacks:
            st.info("Chưa có học sinh nào gửi ý kiến đóng góp.")
        else:
            export_fb = []
            for fid, sname, content, created_at in feedbacks:
                t_str = str(created_at).split(".")[0] if created_at else ""
                with st.chat_message("user"):
                    st.markdown(f"**{sname}** *(lúc {t_str})*")
                    st.write(content)
                export_fb.append({
                    "Mã": fid,
                    "Học sinh": sname,
                    "Nội dung": content,
                    "Thời gian": t_str
                })

            output_fb = io.StringIO()
            writer_fb = csv.DictWriter(output_fb, fieldnames=["Mã", "Học sinh", "Nội dung", "Thời gian"])
            writer_fb.writeheader()
            writer_fb.writerows(export_fb)
            st.download_button(
                label="📥 Tải Toàn Bộ Ý Kiến Đóng Góp (File CSV)",
                data=output_fb.getvalue().encode('utf-8-sig'),
                file_name=f"GopY_HocSinh_{datetime.date.today().strftime('%Y%m%d')}.csv",
                mime="text/csv",
                use_container_width=True
            )

    # --- TAB 3: QUẢN LÝ TIÊU CHÍ ---
    with tab_criteria_admin:
        st.markdown("#### ➕ Thêm Tiêu Chí Bình Chọn Mới")
        with st.form("add_crit_form"):
            new_title = st.text_input("Tên tiêu chí mới:", placeholder="Ví dụ: Đôi bạn cùng tiến gương mẫu tháng 10")
            add_submitted = st.form_submit_button("Thêm tiêu chí", use_container_width=True)
            if add_submitted:
                if add_criterion_db(new_title):
                    st.success(f"Đã thêm tiêu chí: '{new_title}'")
                    st.rerun()
                else:
                    st.warning("Vui lòng nhập tên tiêu chí hợp lệ!")

        st.markdown("---")
        st.markdown("#### 📋 Danh Sách & Xóa Tiêu Chí")
        current_criteria = get_active_criteria()
        if not current_criteria:
            st.write("Hiện chưa có tiêu chí nào.")
        else:
            for cid, ctitle in current_criteria:
                col_title, col_del = st.columns([4, 1])
                with col_title:
                    st.write(f"**[ID {cid}]** {ctitle}")
                with col_del:
                    if st.button("🗑️ Xóa", key=f"del_{cid}"):
                        delete_criterion_db(cid)
                        st.success(f"Đã xóa tiêu chí [ID {cid}]")
                        st.rerun()

    # --- TAB 4: TIẾN ĐỘ THAM GIA ---
    with tab_progress:
        stats = get_system_stats_db()
        total_students = len(student_names)
        voted_count = len(stats["voters"])
        percent = int((voted_count / total_students) * 100) if total_students > 0 else 0

        col1, col2, col3 = st.columns(3)
        col1.metric("Tổng số học sinh", total_students)
        col2.metric("Đã bình chọn", f"{voted_count} bạn", f"{percent}%")
        col3.metric("Số góp ý đã gửi", stats["total_feedback"])

        st.progress(percent / 100)
        st.write(f"Tiến độ hoàn thành của lớp: **{percent}%** ({voted_count}/{total_students} bạn)")

        st.markdown("---")
        st.markdown("#### 📋 Danh sách các bạn chưa tham gia bình chọn:")
        unvoted_students = [s for s in student_names if s not in stats["voters"]]
        if not unvoted_students:
            st.success("🎉 Xuất sắc! 100% học sinh trong lớp đã hoàn tất bình chọn.")
        else:
            st.write(f"Còn **{len(unvoted_students)}** bạn chưa nộp phiếu:")
            st.write(", ".join(unvoted_students))

    # --- TAB 5: RESET MÃ PIN HỌC SINH ---
    with tab_reset:
        st.markdown("#### 🔑 Hỗ trợ học sinh quên Mã PIN")
        st.caption("Xóa mã PIN cũ để học sinh tự tạo mã PIN mới trong lần đăng nhập tiếp theo.")
        target_reset_name = st.selectbox("Chọn học sinh cần reset mã PIN:", options=["-- Chọn học sinh --"] + student_names)
        if st.button("Xác nhận Reset Mã PIN", use_container_width=True):
            if target_reset_name != "-- Chọn học sinh --":
                reset_student_pin_db(target_reset_name)
                st.success(f"Đã reset mã PIN cho bạn: **{target_reset_name}**. Học sinh có thể tự đặt mã PIN mới.")
            else:
                st.warning("Vui lòng chọn học sinh cần reset.")


# ==============================================================================
# GIAO DIỆN HỌC SINH (BÌNH CHỌN & GÓP Ý)
# ==============================================================================
def show_student_login():
    st.title("🗳️ BÌNH CHỌN LỚP HỌC 10B5")
    st.caption("Cổng bình chọn & đóng góp ý kiến bí mật dành cho học sinh")

    if not student_names:
        st.warning("⚠️ Không tìm thấy danh sách học sinh.")
        return

    st.markdown("---")
    selected_name = st.selectbox(
        "👤 Chọn Họ và Tên của bạn trong danh sách lớp:",
        options=["-- Chọn tên của bạn --"] + student_names,
        index=0
    )

    if selected_name == "-- Chọn tên của bạn --":
        st.info("👆 Vui lòng chọn tên của bạn để tiếp tục.")
        return

    registered = is_user_registered(selected_name)

    if not registered:
        st.info(f"👋 Chào mừng **{selected_name}** lần đầu tham gia! Hãy tự đặt một **Mã PIN (4-6 số)** để bảo vệ phiếu bầu của bạn.")
        with st.form("register_form"):
            new_pin = st.text_input("🔑 Tạo Mã PIN mới:", type="password", placeholder="Ví dụ: 123456")
            confirm_pin = st.text_input("🔑 Nhập lại Mã PIN xác nhận:", type="password", placeholder="Nhập lại mã PIN trên")
            submitted = st.form_submit_button("Xác nhận tạo mã & Vào bình chọn", use_container_width=True)

            if submitted:
                if not new_pin or len(new_pin.strip()) < 3:
                    st.error("Mã PIN quá ngắn, vui lòng nhập ít nhất 3 ký tự!")
                elif new_pin != confirm_pin:
                    st.error("Hai lần nhập mã PIN không khớp nhau!")
                else:
                    register_user(selected_name, new_pin)
                    st.session_state["logged_in_user"] = selected_name
                    st.rerun()
    else:
        with st.form("login_form"):
            st.write(f"Chào bạn, **{selected_name}**!")
            pin_input = st.text_input("🔑 Nhập Mã PIN của bạn:", type="password", placeholder="Nhập mã PIN đã tạo")
            submitted = st.form_submit_button("Đăng nhập", use_container_width=True)

            if submitted:
                if verify_user_password(selected_name, pin_input):
                    st.session_state["logged_in_user"] = selected_name
                    st.rerun()
                else:
                    st.error("❌ Mã PIN không chính xác! Nếu quên mã, vui lòng liên hệ Thầy/Cô để được reset.")


def show_student_voting(current_user: str):
    st.title("🗳️ Phiếu Bình Chọn & Đóng Góp Ý Kiến")
    st.write(f"Xin chào **{current_user}**! Hãy hoàn thành các mục bên dưới:")

    tab_vote, tab_feedback = st.tabs(["🗳️ Bình chọn", "💬 Gửi ý kiến góp ý"])

    # --- TAB 1: BÌNH CHỌN ---
    with tab_vote:
        criteria_list = get_active_criteria()
        if not criteria_list:
            st.warning("⚠️ Hiện tại chưa có tiêu chí bình chọn nào được mở. Vui lòng quay lại sau.")
        else:
            voting_candidates = [name for name in student_names if name != current_user]
            saved_votes = get_student_votes(current_user)

            st.write("Vui lòng chọn các bạn học sinh xứng đáng cho từng tiêu chí:")
            votes_to_save = {}

            with st.form("voting_form"):
                for cid, ctitle in criteria_list:
                    st.markdown(f"#### 📌 {ctitle}")
                    default_selected = [
                        target for target in saved_votes.get(cid, [])
                        if target in voting_candidates
                    ]

                    selected = st.multiselect(
                        label=f"Chọn học sinh cho: {ctitle}",
                        options=voting_candidates,
                        default=default_selected,
                        key=f"crit_{cid}",
                        placeholder="Bấm vào để tìm và chọn một hoặc nhiều bạn...",
                        label_visibility="collapsed"
                    )
                    votes_to_save[cid] = selected
                    st.markdown("---")

                save_btn = st.form_submit_button("💾 LƯU PHIẾU BÌNH CHỌN CỦA TÔI", use_container_width=True)
                if save_btn:
                    save_student_votes(current_user, votes_to_save)
                    st.success("🎉 Đã lưu thành công phiếu bình chọn của bạn!")
                    st.balloons()

    # --- TAB 2: GỬI Ý KIẾN GÓP Ý ---
    with tab_feedback:
        st.markdown("#### 💬 Lời nhắn & Đóng góp ý kiến cho Lớp học / Thầy Cô")
        st.write("Bạn có thể thoải mái chia sẻ những tâm tư, nguyện vọng hoặc đề xuất hoạt động cho lớp:")

        with st.form("feedback_form"):
            feedback_text = st.text_area(
                "Nội dung ý kiến:",
                placeholder="Nhập ý kiến đóng góp, đề xuất của bạn tại đây...",
                rows=4
            )
            submit_fb = st.form_submit_button("📤 Gửi ý kiến đóng góp", use_container_width=True)

            if submit_fb:
                if not feedback_text.strip():
                    st.warning("Vui lòng nhập nội dung ý kiến trước khi gửi!")
                else:
                    save_student_feedback(current_user, feedback_text)
                    st.success("✅ Cảm ơn bạn! Ý kiến đóng góp đã được gửi thành công.")

        prev_fb = get_student_previous_feedback(current_user)
        if prev_fb:
            with st.expander("📝 Xem lại các ý kiến bạn đã gửi gần đây"):
                for content, created_at in prev_fb:
                    t_str = str(created_at).split(".")[0] if created_at else ""
                    st.markdown(f"- *[{t_str}]*: {content}")


# ==============================================================================
# ĐIỀU HƯỚNG TỔNG THỂ (SIDEBAR NAVIGATION)
# ==============================================================================
with st.sidebar:
    st.markdown("### ⚙️ Chế độ sử dụng")
    mode = st.radio(
        "Bạn là:",
        options=["🎓 Học sinh", "🔒 Giáo viên (Quản trị)"],
        index=1 if st.session_state["is_admin_logged_in"] else 0
    )
    st.markdown("---")

    if mode == "🎓 Học sinh":
        if st.session_state["logged_in_user"]:
            st.markdown(f"**Học sinh:** {st.session_state['logged_in_user']}")
            if st.button("🚪 Đăng xuất", use_container_width=True):
                st.session_state["logged_in_user"] = None
                st.rerun()
            st.markdown("---")
            st.caption("🗳️ *Phiếu bầu của bạn được bảo mật tuyệt đối.*")
    else:
        if not st.session_state["is_admin_logged_in"]:
            st.markdown("#### 🔐 Đăng nhập Quản trị:")
            admin_pin_input = st.text_input("Mã PIN Quản trị viên:", type="password", placeholder="Mặc định: 123456")
            if st.button("Đăng nhập Admin", use_container_width=True):
                actual_admin_pin = st.secrets.get("ADMIN_PIN", DEFAULT_ADMIN_PIN) if hasattr(st, "secrets") else DEFAULT_ADMIN_PIN
                if admin_pin_input == actual_admin_pin:
                    st.session_state["is_admin_logged_in"] = True
                    st.rerun()
                else:
                    st.error("Mã PIN Admin không đúng!")
        else:
            st.write("Tư cách: **Giáo viên / Quản trị**")
            if st.button("🚪 Thoát Quản trị", use_container_width=True):
                st.session_state["is_admin_logged_in"] = False
                st.rerun()


# Hiển thị màn hình theo quyền
if mode == "🔒 Giáo viên (Quản trị)":
    if st.session_state["is_admin_logged_in"]:
        show_admin_portal()
    else:
        st.title("🔒 Cổng Dành Cho Giáo Viên")
        st.info("👈 Vui lòng nhập Mã PIN Quản trị ở thanh bên trái (Sidebar) để truy cập cổng giáo viên.")
else:
    if st.session_state["logged_in_user"] is None:
        show_student_login()
    else:
        show_student_voting(st.session_state["logged_in_user"])
