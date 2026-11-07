// ==============================================================================
// CẤU HÌNH ĐƯỜNG DẪN GOOGLE APPS SCRIPT
// Thầy chỉ cần dán URL Web App của Thầy vào đây:
// ==============================================================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwOTOlh0sjr8QZzUdFsol7HhCv79lQbyoBF0VZyPIpcz973Il0fnM_gmMvTfSehqsZbVg/exec';

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
    pinSection: document.getElementById('pin-section'),
    pinInput: document.getElementById('pin-input'),
    togglePinVisibility: document.getElementById('toggle-pin-visibility'),
    pinEyeIcon: document.getElementById('pin-eye-icon'),
    pinError: document.getElementById('pin-error'),
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
function getCurrentRoundId() {
    return (window.POLL_CONFIG && window.POLL_CONFIG.roundId) ? window.POLL_CONFIG.roundId : 'default_round';
}

function getVotedStorageKey() {
    return 'voted_students_' + getCurrentRoundId();
}

function applyPollConfig() {
    if (!window.POLL_CONFIG) return;
    const cfg = window.POLL_CONFIG;
    
    if (cfg.appTitle) {
        const el = document.getElementById('app-title');
        if (el) el.textContent = cfg.appTitle;
        document.title = cfg.appTitle + " - Lớp 10B5";
    }
    if (cfg.appSubtitle) {
        const el = document.getElementById('app-subtitle');
        if (el) el.textContent = cfg.appSubtitle;
    }
    if (cfg.promptTitle) {
        const el = document.getElementById('prompt-title');
        if (el) el.textContent = cfg.promptTitle;
    }
    if (cfg.promptDesc) {
        const el = document.getElementById('prompt-desc');
        if (el) el.textContent = cfg.promptDesc;
    }
    if (cfg.feedbackTitle) {
        const el = document.getElementById('feedback-title');
        if (el) el.textContent = cfg.feedbackTitle;
    }
    if (cfg.feedbackDesc) {
        const el = document.getElementById('feedback-desc');
        if (el) el.textContent = cfg.feedbackDesc;
    }
    if (cfg.feedbackPlaceholder) {
        const el = document.getElementById('feedback-input');
        if (el) el.placeholder = cfg.feedbackPlaceholder;
    }
    if (cfg.submitButtonText) {
        const el = document.getElementById('submit-btn-text');
        if (el) el.textContent = cfg.submitButtonText;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    applyPollConfig();
    initTheme();
    setupEventListeners();
    renderModalStudentsList();
    if (window.lucide) {
        lucide.createIcons();
    }
    // Tự động đồng bộ Tiêu đề & Mã đợt mới từ Google Sheet trong nền (nếu GVCN sửa trên Sheet)
    fetchRemoteConfig();
});

// Đồng bộ cấu hình động từ Google Sheet (Chạy ngầm, không làm chậm giao diện)
async function fetchRemoteConfig() {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('AKfycbw...')) return;
    try {
        const resp = await fetch(`${GOOGLE_SCRIPT_URL}?action=getConfig`, {
            cache: 'no-cache'
        });
        if (resp.ok) {
            const data = await resp.json();
            if (data && data.status === 'success') {
                let updated = false;
                if (data.appTitle && (!window.POLL_CONFIG || data.appTitle !== window.POLL_CONFIG.appTitle)) {
                    window.POLL_CONFIG = window.POLL_CONFIG || {};
                    window.POLL_CONFIG.appTitle = data.appTitle;
                    updated = true;
                }
                if (data.promptTitle && (!window.POLL_CONFIG || data.promptTitle !== window.POLL_CONFIG.promptTitle)) {
                    window.POLL_CONFIG = window.POLL_CONFIG || {};
                    window.POLL_CONFIG.promptTitle = data.promptTitle;
                    updated = true;
                }
                if (data.roundId && (!window.POLL_CONFIG || data.roundId !== window.POLL_CONFIG.roundId)) {
                    console.log("Phát hiện đợt mới từ Google Sheet:", data.roundId);
                    window.POLL_CONFIG = window.POLL_CONFIG || {};
                    window.POLL_CONFIG.roundId = data.roundId;
                    updated = true;
                }
                if (updated) {
                    applyPollConfig();
                }
            }
        }
    } catch (e) {
        // Nếu offline, giữ nguyên cấu hình tĩnh poll_config.js
    }
}

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
// XỬ LÝ MÀN HÌNH 1: ĐĂNG NHẬP & XÁC THỰC MÃ PIN NGÀY SINH
// ==============================================================================

// Hàm băm bảo mật SHA-256 (Web Crypto API)
async function hashStudentPin(name, pin) {
    const text = `${name}_${pin.trim()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function setupEventListeners() {
    // Tìm kiếm với Autocomplete
    elements.studentInput.addEventListener('input', handleStudentInput);
    elements.studentInput.addEventListener('keydown', handleKeyNavigation);

    elements.clearInputBtn.addEventListener('click', () => {
        elements.studentInput.value = '';
        elements.clearInputBtn.classList.add('hidden');
        elements.suggestionsBox.classList.add('hidden');
        elements.pinSection.classList.add('hidden');
        elements.pinInput.value = '';
        hidePinError();
        elements.loginSubmitBtn.disabled = true;
        elements.loginSubmitBtn.querySelector('span').textContent = "Vào bình chọn";
        elements.studentInput.focus();
    });

    // Xử lý ô PIN
    elements.pinInput.addEventListener('input', () => {
        hidePinError();
        // Tự động xác thực ngay khi nhập đủ 4 số
        if (elements.pinInput.value.trim().length === 4) {
            verifyPinAndLogin();
        }
    });

    elements.pinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            verifyPinAndLogin();
        }
    });

    // Ẩn / Hiện mã PIN
    elements.togglePinVisibility.addEventListener('click', () => {
        const isPass = elements.pinInput.type === 'password';
        elements.pinInput.type = isPass ? 'text' : 'password';
        elements.pinEyeIcon.setAttribute('data-lucide', isPass ? 'eye-off' : 'eye');
        if (window.lucide) lucide.createIcons();
    });

    elements.loginSubmitBtn.addEventListener('click', () => {
        verifyPinAndLogin();
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

// Khi người dùng chọn 1 bạn từ ô nhập hoặc từ modal
function selectStudentForLogin(name) {
    elements.studentInput.value = name;
    elements.clearInputBtn.classList.remove('hidden');
    elements.suggestionsBox.classList.add('hidden');
    
    // Mở khung nhập PIN xác thực
    elements.pinSection.classList.remove('hidden');
    elements.pinInput.value = '';
    hidePinError();
    elements.loginSubmitBtn.disabled = false;
    elements.loginSubmitBtn.querySelector('span').textContent = "Xác nhận & Vào bình chọn";
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        elements.pinInput.focus();
    }, 150);
}

// Kiểm tra mã PIN ngày sinh
async function verifyPinAndLogin() {
    const name = elements.studentInput.value.trim();
    if (!STUDENTS_SECURITY_DATA[name]) {
        alert("Vui lòng chọn họ và tên của bạn trong danh sách trước.");
        return;
    }

    const pin = elements.pinInput.value.trim();
    if (!pin) {
        showPinError("Vui lòng nhập 4 số Ngày & Tháng sinh (VD: 0509)!");
        elements.pinInput.focus();
        return;
    }

    // Hash và so khớp
    const currentHash = await hashStudentPin(name, pin);
    const validHashes = STUDENTS_SECURITY_DATA[name] || [];

    if (validHashes.includes(currentHash)) {
        hidePinError();

        // 1. Kiểm tra nhanh trong bộ nhớ thiết bị theo Đợt hiện tại (roundId)
        const storageKey = getVotedStorageKey();
        const votedList = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (votedList.includes(name)) {
            alert(`⚠️ Bạn "${name}" đã nộp phiếu ở đợt này rồi!\nTheo quy định, mỗi học sinh chỉ được gửi 1 lần duy nhất trong mỗi đợt.`);
            return;
        }

        // 2. Vào thẳng màn hình bình chọn NGAY TỨC THÌ (0.1 giây, siêu mượt)
        // Việc chống gian lận được chốt chặn an toàn ở bước bấm 'Nộp phiếu' (Google Sheet Backend)
        proceedToVote(name);
    } else {
        showPinError("❌ Mã PIN ngày sinh chưa đúng! Vui lòng kiểm tra lại ngày & tháng sinh (DDMM).");
        elements.pinInput.select();
    }
}

// Kiểm tra thời gian thực trên Google Sheets trước khi cho vào màn hình bình chọn
async function checkOnlineStatusAndProceed(name) {
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('AKfycbw...')) {
        proceedToVote(name);
        return;
    }

    // Hiển thị loading nhẹ
    elements.loadingOverlay.classList.remove('hidden');
    const loadingText = elements.loadingOverlay.querySelector('p');
    const oldText = loadingText ? loadingText.textContent : 'Đang xử lý...';
    if (loadingText) loadingText.textContent = 'Đang kiểm tra trạng thái phiếu bầu...';

    let hasVotedOnline = false;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout để tránh gián đoạn nếu mạng chậm

        const resp = await fetch(`${GOOGLE_SCRIPT_URL}?action=check&voter=${encodeURIComponent(name)}&round=${encodeURIComponent(getCurrentRoundId())}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
            const result = await resp.json();
            if (result && result.hasVoted) {
                hasVotedOnline = true;
            }
        }
    } catch (e) {
        console.warn("Không thể kiểm tra online trước, dựa vào chốt chặn bảo mật backend:", e);
    } finally {
        elements.loadingOverlay.classList.add('hidden');
        if (loadingText) loadingText.textContent = oldText;
    }

    if (hasVotedOnline) {
        // Lưu vào Local Storage theo đợt hiện tại
        const storageKey = getVotedStorageKey();
        const votedList = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!votedList.includes(name)) {
            votedList.push(name);
            localStorage.setItem(storageKey, JSON.stringify(votedList));
        }
        alert(`⚠️ Bạn "${name}" đã nộp phiếu ở đợt này thành công trước đó trên hệ thống!\nTheo quy định, mỗi học sinh chỉ được gửi 1 lần duy nhất trong mỗi đợt.`);
        return;
    }

    proceedToVote(name);
}

function showPinError(msg) {
    elements.pinError.textContent = msg;
    elements.pinError.classList.remove('hidden');
    // Kích hoạt animation rung
    elements.pinError.classList.remove('shake');
    void elements.pinError.offsetWidth;
    elements.pinError.classList.add('shake');
}

function hidePinError() {
    elements.pinError.textContent = '';
    elements.pinError.classList.add('hidden');
}

function handleStudentInput(e) {
    const query = e.target.value.trim();
    if (query.length > 0) {
        elements.clearInputBtn.classList.remove('hidden');
    } else {
        elements.clearInputBtn.classList.add('hidden');
        elements.suggestionsBox.classList.add('hidden');
        elements.pinSection.classList.add('hidden');
        elements.pinInput.value = '';
        hidePinError();
        elements.loginSubmitBtn.disabled = true;
        elements.loginSubmitBtn.querySelector('span').textContent = "Vào bình chọn";
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
        selectStudentForLogin(exactMatch);
    } else {
        elements.pinSection.classList.add('hidden');
        elements.loginSubmitBtn.disabled = true;
        elements.loginSubmitBtn.querySelector('span').textContent = "Vào bình chọn";
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
            selectStudentForLogin(name);
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
            selectStudentForLogin(name);
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
    elements.pinSection.classList.add('hidden');
    elements.pinInput.value = '';
    hidePinError();
    elements.loginSubmitBtn.disabled = true;
    elements.loginSubmitBtn.querySelector('span').textContent = "Vào bình chọn";

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
        alert("Vui lòng tích chọn ít nhất 1 bạn học sinh làm ồn hoặc nhập ý kiến phản ánh trước khi nộp!");
        return;
    }

    let confirmMsg = `Em đang nộp phiếu phản ánh nề nếp với tên: ${state.currentUser}\n`;
    if (selectedList.length > 0) {
        confirmMsg += `• Số bạn phản ánh làm ồn: ${selectedList.length} bạn\n`;
    }
    if (feedback) {
        confirmMsg += `• Có kèm ý kiến phản ánh riêng cho GVCN\n`;
    }
    confirmMsg += `\nEm có chắc chắn muốn gửi phiếu này?`;

    if (!confirm(confirmMsg)) {
        return;
    }

    // Hiển thị Loading
    elements.loadingOverlay.classList.remove('hidden');

    const payload = {
        voter: state.currentUser,
        selected: selectedList,
        feedback: feedback,
        roundId: getCurrentRoundId(),
        timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })
    };

    try {
        console.log("Đang gửi dữ liệu về Google Apps Script...", payload);
        
        // Gửi không đồng bộ với mode no-cors theo chuẩn Google Apps Script
        // Dùng text/plain để tránh bị trình duyệt (Safari/Chrome) chặn Preflight CORS
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
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

        // Lưu danh sách bạn đã nộp theo ĐỢT HIỆN TẠI (roundId) trên thiết bị này
        const storageKey = getVotedStorageKey();
        const votedList = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!votedList.includes(payload.voter)) {
            votedList.push(payload.voter);
            localStorage.setItem(storageKey, JSON.stringify(votedList));
        }
    } catch (e) {}
}

function showSuccessScreen(payload) {
    elements.successSummary.textContent = `Hệ thống đã ghi nhận phiếu phản ánh của em (${payload.voter})!`;

    let html = `
        <div class="receipt-item">
            <b>Người gửi:</b> <span>${payload.voter}</span>
        </div>
        <div class="receipt-item">
            <b>Các bạn làm ồn đã chọn:</b> <span>${payload.selected.length > 0 ? payload.selected.join(', ') : '<i>(Không chọn ai)</i>'}</span>
        </div>
    `;

    if (payload.feedback) {
        html += `
            <div class="receipt-item">
                <b>Lời nhắn / Đề xuất riêng:</b> <span>${payload.feedback}</span>
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
