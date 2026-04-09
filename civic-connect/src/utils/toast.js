export function showToast(msg, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ️'}</span>${msg}`;
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(t);
        setTimeout(() => { 
            t.classList.add('out'); 
            setTimeout(() => t.remove(), 350); 
        }, 3500);
    }
}
