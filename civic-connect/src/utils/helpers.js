export function getStatusBadgeData(s) {
    const map = { 
        'open': { class: 'badge-open', name: 'Open' }, 
        'in-progress': { class: 'badge-progress', name: 'In Progress' }, 
        'resolved': { class: 'badge-resolved', name: 'Resolved' } 
    };
    return map[s] || map['open'];
}

export function getCatIcon(c) {
    return { 
        Infrastructure: '🛣️', Health: '❤️', Education: '📚', 
        Safety: '🛡️', Environment: '🌿', Other: '📌' 
    }[c] || '📌';
}

export function getCatClass(c) {
    return { 
        Infrastructure: 'cat-infrastructure', Health: 'cat-health', 
        Education: 'cat-education', Safety: 'cat-safety', 
        Environment: 'cat-environment', Other: 'cat-other' 
    }[c] || 'cat-other';
}
