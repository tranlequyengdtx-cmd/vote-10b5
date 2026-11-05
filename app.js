// ==============================================================================
// CẤU HÌNH ĐƯỜNG DẪN GOOGLE APPS SCRIPT
// Thầy chỉ cần dán URL Web App của Thầy vào đây:
// ==============================================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwPzN1jQ49j55qT4uL54XWn6q_Placeholder/exec';

// Trạng thái ứng dụng
const state = {
    currentUser: null,
    selectedCandidates: new Set(),
    feedbackText: ''
};

// DOM Elements
const elements = {
    themeToggle: document.getElementById('theme-toggle'),
    themeIcon: document.getElementById('theme-icon'),
    
    // Screens
    screenLogin: document.getElementById('screen-login'),
    screenVote: document.getElementById('screen-vote'),
    screenSuccess: document.getElementById('screen-success'),
    
    // Login Screen
    studentInput: document.getElementById('student-input'),
    clearInputBtn: document.getElementById('clear-input-btn'),
    suggestionsBox: document.getElementById('suggestions-box'),
    openModalBtn: document.getElementById('open-modal-btn'),
    loginSubmitBtn: document.getElementById('login-submit-btn'),
    
    // Vote Screen
    currentUserDisplay: document.getElementById('current-user-display'),
    logoutBtn: document.getElementById('logout-btn'),
    filterCandidateInput: document.getElementById('filter-candidate-input'),
    selectedCount: document.getElementById('selected-count'),
    candidatesGrid: document.getElementById('candidates-grid'),
    feedbackInput: document.getElementById('feedback-input'),
    submitVoteBtn: document.getElementById('submit-vote-btn'),
    
    // Success Screen
    successSummary: document.getElementById('success-summary'),
    receiptBox: document.getElementById('receipt-box'),
    nextStudentBtn: document.getElementById('next-student-btn'),
    
    // Modal
    studentsModal: document.getElementById('students-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    modalFilterInput: document.getElementById('modal-filter-input'),
    modalStudentsList: document.getElementById('modal-students-list'),
    
    // Loading
    loadingOverlay: document.getElementById('loading-overlay')
};

// ==============================================================================
// KHỞI TẠO & HỖ TRỢ GIAO DIỆN
// ==============================================================================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupEventListeners();
    renderModalStudentsList();
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Chuyển màn hình
function showScreen(screenName) {
    elements.screenLogin.classList.remove('active');
    elements.screenVote.classList.remove('active');
    elements.screenSuccess.classList.remove('active');

    if (screenName === 'login') {
        elements.screenLogin.classList.add('active');
        elements.studentInput.focus();
    } else if (screenName === 'vote') {
        elements.screenVote.classList.add('active');
        renderCandidatesGrid();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (screenName === 'success') {
        elements.screenSuccess.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (window.lucide) {
        lucide.createIcons();
    }
}

// Bật / Tắt Giao diện Sáng / Tối
function initTheme() {
    const savedTheme = localStorage.getItem('vote_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.classList.add('light-mode');
        elements.themeIcon.setAttribute('data-lucide', 'moon');
    } else {
        document.body.classList.remove('light-mode');
        elements.themeIcon.setAttribute('data-lucide', 'sun');
    }
}

elements.themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLight = document.body.classList.contains('light-mode');
    localStorage.setItem('vote_theme', isLight ? 'light' : 'dark');
    elements.themeIcon.setAttribute('data-lucide', isLight ? 'moon' : 'sun');
    if (window.lucide) {
        lucide.createIcons();
    }
});

// Loại bỏ dấu tiếng Việt để tìm kiếm thông minh
function removeVietnameseTones(str) {
    if (!str) return '';
    str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    str = str.replace(/[đĐ]/g, 'd');
    return str.toLowerCase().trim();
}

// ==============================================================================
// XỬ LÝ MÀN HÌNH 1: ĐĂNG NHẬP / CHỌN TÊN
// ==============================================================================
function setupEventListeners() {
    // Tìm kiếm với Autocomplete
    elements.studentInput.addEventListener('input', handleStudentInput);
    elements.studentInput.addEventListener('keydown', handleKeyNavigation);

    elements.clearInputBtn.addEventListener('click', () => {
        elements.studentInput.value = '';
        elements.clearInputBtn.classList.add('hidden');
        elements.suggestionsBox.classList.add('hidden');
        elements.loginSubmitBtn.disabled = true;
        elements.studentInput.focus();
    });

    elements.loginSubmitBtn.addEventListener('click', () => {
        const name = elements.studentInput.value.trim();
        if (STUDENTS_LIST.includes(name)) {
            proceedToVote(name);
        }
    });

    // Modal Danh sách lớp
    elements.openModalBtn.addEventListener('click', () => {
        elements.studentsModal.classList.remove('hidden');
        elements.modalFilterInput.value = '';
        renderModalStudentsList();
        elements.modalFilterInput.focus();
        if (window.lucide) lucide.createIcons();
    });

    elements.closeModalBtn.addEventListener('click', () => {
        elements.studentsModal.classList.add('hidden');
    });

    elements.studentsModal.addEventListener('click', (e) => {
        if (e.target === elements.studentsModal) {
            elements.studentsModal.classList.add('hidden');
        }
    });

    elements.modalFilterInput.addEventListener('input', (e) => {
        renderModalStudentsList(e.target.value.trim());
    });

    // Màn hình bình chọn
    elements.logoutBtn.addEventListener('click', () => {
        if (confirm("Bạn có muốn đổi tên hoặc đăng xuất không?")) {
            resetToLogin();
        }
    });

    elements.filterCandidateInput.addEventListener('input', (e) => {
        renderCandidatesGrid(e.target.value.trim());
    });

    elements.submitVoteBtn.addEventListener('click', handleVoteSubmit);

    elements.nextStudentBtn.addEventListener('click', resetToLogin);
}

function handleStudentInput(e) {
    const query = e.target.value.trim();
    if (query.length > 0) {
        elements.clearInputBtn.classList.remove('hidden');
    } else {
        elements.clearInputBtn.classList.add('hidden');
        elements.suggestionsBox.classList.add('hidden');
        elements.loginSubmitBtn.disabled = true;
        return;
    }

    const cleanQuery = removeVietnameseTones(query);
    const matches = STUDENTS_LIST.filter(name => {
        return removeVietnameseTones(name).includes(cleanQuery);
    });

    if (matches.length > 0) {
        renderSuggestions(matches);
        elements.suggestionsBox.classList.remove('hidden');
    } else {
        elements.suggestionsBox.classList.add('hidden');
    }

    // Nếu người dùng nhập chuẩn xác đúng 100% họ tên có trong danh sách
    const exactMatch = STUDENTS_LIST.find(name => name.toLowerCase() === query.toLowerCase());
    if (exactMatch) {
        elements.studentInput.value = exactMatch;
        elements.loginSubmitBtn.disabled = false;
    } else {
        elements.loginSubmitBtn.disabled = true;
    }
}

function renderSuggestions(matches) {
    elements.suggestionsBox.innerHTML = '';
    matches.slice(0, 8).forEach(name => {
        const item = document.createElement('div');
        item.className = 'suggestion-item';
        item.innerHTML = `
            <span>${name}</span>
            <i data-lucide="check" style="width: 16px; height: 16px; opacity: 0.5;"></i>
        `;
        item.addEventListener('click', () => {
            elements.studentInput.value = name;
            elements.suggestionsBox.classList.add('hidden');
            elements.loginSubmitBtn.disabled = false;
            proceedToVote(name);
        });
        elements.suggestionsBox.appendChild(item);
    });
    if (window.lucide) lucide.createIcons();
}

function handleKeyNavigation(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const firstSuggestion = elements.suggestionsBox.querySelector('.suggestion-item');
        if (firstSuggestion && !elements.suggestionsBox.classList.contains('hidden')) {
            firstSuggestion.click();
        } else if (!elements.loginSubmitBtn.disabled) {
            elements.loginSubmitBtn.click();
        }
    }
}

function renderModalStudentsList(filterText = '') {
    elements.modalStudentsList.innerHTML = '';
    const cleanFilter = removeVietnameseTones(filterText);

    const filtered = STUDENTS_LIST.filter(name => {
        return removeVietnameseTones(name).includes(cleanFilter);
    });

    if (filtered.length === 0) {
        elements.modalStudentsList.innerHTML = '<p style="text-align:center; padding: 20px; color: var(--text-secondary);">Không tìm thấy học sinh nào</p>';
        return;
    }

    filtered.forEach((name, index) => {
        const originalIndex = STUDENTS_LIST.indexOf(name) + 1;
        const row = document.createElement('div');
        row.className = 'modal-student-row';
        row.innerHTML = `
            <span><b>#${originalIndex}</b>. ${name}</span>
            <i data-lucide="chevron-right" style="width: 18px; height: 18px;"></i>
        `;
        row.addEventListener('click', () => {
            elements.studentsModal.classList.add('hidden');
            elements.studentInput.value = name;
            elements.loginSubmitBtn.disabled = false;
            proceedToVote(name);
        });
        elements.modalStudentsList.appendChild(row);
    });

    if (window.lucide) lucide.createIcons();
}

function proceedToVote(studentName) {
    state.currentUser = studentName;
    state.selectedCandidates.clear();
    state.feedbackText = '';

    elements.currentUserDisplay.textContent = studentName;
    elements.feedbackInput.value = '';
    elements.filterCandidateInput.value = '';
    updateSelectedCounter();

    showScreen('vote');
}

function resetToLogin() {
    state.currentUser = null;
    state.selectedCandidates.clear();
    state.feedbackText = '';

    elements.studentInput.value = '';
    elements.clearInputBtn.classList.add('hidden');
    elements.suggestionsBox.classList.add('hidden');
    elements.loginSubmitBtn.disabled = true;

    showScreen('login');
}

// ==============================================================================
// XỬ LÝ MÀN HÌNH 2: BÌNH CHỌN (TÍCH CHỌN THẺ TRẮC NGHIỆM)
// ==============================================================================
function renderCandidatesGrid(filterText = '') {
    elements.candidatesGrid.innerHTML = '';
    const cleanFilter = removeVietnameseTones(filterText);

    // 45 học sinh khác (loại trừ chính mình)
    const availableStudents = STUDENTS_LIST.filter(name => name !== state.currentUser);
    const filtered = availableStudents.filter(name => {
        return removeVietnameseTones(name).includes(cleanFilter);
    });

    if (filtered.length === 0) {
        elements.candidatesGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 30px; color: var(--text-secondary);">
                Không tìm thấy bạn nào khớp với từ khóa "${filterText}"
            </div>
        `;
        return;
    }

    filtered.forEach(name => {
        const isSelected = state.selectedCandidates.has(name);
        const card = document.createElement('div');
        card.className = `candidate-card ${isSelected ? 'selected' : ''}`;
        
        // Lấy chữ cái đầu tiên làm Avatar
        const initials = name.split(' ').pop().charAt(0).toUpperCase();

        card.innerHTML = `
            <div class="candidate-info">
                <div class="avatar-circle">${initials}</div>
                <span class="candidate-name">${name}</span>
            </div>
            <div class="check-icon-wrapper">
                <i data-lucide="${isSelected ? 'check' : 'plus'}"></i>
            </div>
        `;

        card.addEventListener('click', () => {
            toggleCandidateSelection(name, card);
        });

        elements.candidatesGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
}

function toggleCandidateSelection(name, cardElement) {
    if (state.selectedCandidates.has(name)) {
        state.selectedCandidates.delete(name);
        cardElement.classList.remove('selected');
        const iconWrapper = cardElement.querySelector('.check-icon-wrapper');
        iconWrapper.innerHTML = '<i data-lucide="plus"></i>';
    } else {
        state.selectedCandidates.add(name);
        cardElement.classList.add('selected');
        const iconWrapper = cardElement.querySelector('.check-icon-wrapper');
        iconWrapper.innerHTML = '<i data-lucide="check"></i>';
    }

    updateSelectedCounter();
    if (window.lucide) lucide.createIcons();
}

function updateSelectedCounter() {
    elements.selectedCount.textContent = state.selectedCandidates.size;
}

// ==============================================================================
// GỬI DỮ LIỆU VỀ GOOGLE DRIVE / GOOGLE APPS SCRIPT
// ==============================================================================
async function handleVoteSubmit() {
    const selectedList = Array.from(state.selectedCandidates);
    const feedback = elements.feedbackInput.value.trim();

    // Xác nhận nếu chưa chọn ai và chưa viết feedback
    if (selectedList.length === 0 && !feedback) {
        alert("Vui lòng tích chọn ít nhất 1 bạn học sinh hoặc nhập ý kiến góp ý trước khi nộp!");
        return;
    }

    let confirmMsg = `Bạn đang nộp phiếu với tư cách là: ${state.currentUser}\n`;
    if (selectedList.length > 0) {
        confirmMsg += `• Số bạn được bình chọn: ${selectedList.length} bạn\n`;
    }
    if (feedback) {
        confirmMsg += `• Có gửi kèm ý kiến đề xuất riêng\n`;
    }
    confirmMsg += `\nBạn có chắc chắn muốn gửi phiếu này?`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // Hiển thị Loading
    elements.loadingOverlay.classList.remove('hidden');

    const payload = {
        voter: state.currentUser,
        selected: selectedList,
        feedback: feedback,
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    };

    try {
        console.log("Đang gửi dữ liệu về Google Apps Script...", payload);
        
        // Gửi không đồng bộ với mode no-cors theo đúng chuẩn Mathflow
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        console.log("Đã hoàn tất gửi.");
    } catch (error) {
        console.warn("Lỗi fetch (vẫn lưu cục bộ dự phòng):", error);
    } finally {
        // Lưu lịch sử local dự phòng
        saveLocalBackup(payload);

        // Ẩn loading sau nửa giây
        setTimeout(() => {
            elements.loadingOverlay.classList.add('hidden');
            showSuccessScreen(payload);
        }, 500);
    }
}

function saveLocalBackup(payload) {
    try {
        const history = JSON.parse(localStorage.getItem('vote_history') || '[]');
        history.push(payload);
        localStorage.setItem('vote_history', JSON.stringify(history));
    } catch (e) {}
}

function showSuccessScreen(payload) {
    elements.successSummary.textContent = `Hệ thống đã ghi nhận phiếu của bạn (${payload.voter})!`;

    let html = `
        <div class="receipt-item">
            <b>Người gửi:</b> <span>${payload.voter}</span>
        </div>
        <div class="receipt-item">
            <b>Đã bầu cho:</b> <span>${payload.selected.length > 0 ? payload.selected.join(', ') : '<i>(Không chọn ai)</i>'}</span>
        </div>
    `;

    if (payload.feedback) {
        html += `
            <div class="receipt-item">
                <b>Lời nhắn/Góp ý:</b> <span>${payload.feedback}</span>
            </div>
        `;
    }

    html += `
        <div class="receipt-item">
            <b>Thời gian:</b> <span>${payload.timestamp}</span>
        </div>
    `;

    elements.receiptBox.innerHTML = html;
    showScreen('success');
}
