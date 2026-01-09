/**
 * Marie AI — Chat Application
 * iOS 26 Style with Aurora Progress Bar
 */

// ========================================
// КОНФИГУРАЦИЯ — ЗАПОЛНИ СВОИ ДАННЫЕ
// ========================================

const CONFIG = {
    // 🌐 RunPod FastAPI endpoint
    API_URL: 'https://t9hbq0d27rx2hx-8000.proxy.runpod.net/chat'
};

// ========================================
// СОСТОЯНИЕ
// ========================================

const state = {
    messages: [],
    isLoading: false
};

// ========================================
// DOM
// ========================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const el = {
    chat: $('#chatContainer'),
    input: $('#messageInput'),
    sendBtn: $('#sendBtn'),
    clearBtn: $('#clearBtn'),
    sourcesBtn: $('#sourcesBtn'),
    searchBtn: $('#searchBtn'),
    voiceBtn: $('#voiceBtn'),
    modal: $('#sourcesModal'),
    closeModal: $('#closeModal'),
    progressBar: $('#progressBar')
};

// ========================================
// PROGRESS BAR
// ========================================

function showProgress() {
    el.progressBar.classList.add('active');
}

function hideProgress() {
    el.progressBar.classList.remove('active');
}

// ========================================
// API
// ========================================

async function sendMessage(text) {
    const response = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
    });

    if (!response.ok) {
        throw new Error('API Error');
    }

    const data = await response.json();
    return data.response || 'Не удалось получить ответ.';
}

// ========================================
// UI
// ========================================

function createMessageElement(role, content) {
    const div = document.createElement('div');
    div.className = `message ${role}`;
    div.innerHTML = `<div class="message-bubble">${escapeHtml(content)}</div>`;
    return div;
}

function createTypingIndicator() {
    const div = document.createElement('div');
    div.className = 'message assistant';
    div.id = 'typing';
    div.innerHTML = `
        <div class="typing-indicator">
            <span></span>
            <span></span>
            <span></span>
        </div>
    `;
    return div;
}

function addMessage(role, content) {
    state.messages.push({ role, content });
    const msgEl = createMessageElement(role, content);
    el.chat.appendChild(msgEl);
    scrollToBottom();
}

function showTyping() {
    el.chat.appendChild(createTypingIndicator());
    scrollToBottom();
}

function hideTyping() {
    const typing = $('#typing');
    if (typing) typing.remove();
}

function showError(msg) {
    const div = document.createElement('div');
    div.className = 'error-message';
    div.textContent = msg;
    el.chat.appendChild(div);
    scrollToBottom();
    setTimeout(() => div.remove(), 4000);
}

function scrollToBottom() {
    requestAnimationFrame(() => {
        el.chat.scrollTop = el.chat.scrollHeight;
    });
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
}

function clearChat() {
    state.messages = [];
    el.chat.innerHTML = '';
}

// ========================================
// HANDLERS
// ========================================

async function handleSend() {
    const text = el.input.value.trim();
    if (!text || state.isLoading) return;

    el.input.value = '';
    addMessage('user', text);
    
    state.isLoading = true;
    showProgress();
    showTyping();

    try {
        const response = await sendMessage(text);
        hideTyping();
        addMessage('assistant', response);
    } catch (err) {
        hideTyping();
        showError('Ошибка соединения. Проверь API ключ.');
        console.error(err);
    } finally {
        state.isLoading = false;
        hideProgress();
    }
}

function openModal() {
    el.modal.classList.add('active');
}

function closeModal() {
    el.modal.classList.remove('active');
}

// ========================================
// EVENTS
// ========================================

el.sendBtn.addEventListener('click', handleSend);

el.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
});

el.clearBtn.addEventListener('click', clearChat);

el.sourcesBtn.addEventListener('click', openModal);
el.closeModal.addEventListener('click', closeModal);

el.modal.addEventListener('click', (e) => {
    if (e.target === el.modal) closeModal();
});

// Swipe down to close modal
let touchStartY = 0;
el.modal.querySelector('.modal').addEventListener('touchstart', (e) => {
    touchStartY = e.touches[0].clientY;
});

el.modal.querySelector('.modal').addEventListener('touchmove', (e) => {
    const touchY = e.touches[0].clientY;
    const diff = touchY - touchStartY;
    if (diff > 100) closeModal();
});

// ========================================
// INIT
// ========================================

console.log('✨ Marie AI ready');

// Focus input on desktop
if (window.innerWidth > 600) {
    el.input.focus();
}
