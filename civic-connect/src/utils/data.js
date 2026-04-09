// ============================================================
// DATA STORE — CivicConnect
// ============================================================
export const DB_KEYS = {
    users: 'cp_users',
    issues: 'cp_issues',
    announcements: 'cp_announcements',
    session: 'cp_session',
    flags: 'cp_flags',
    responses: 'cp_responses',
    notifications: 'cp_notifications',
};

// ── Generic helpers ──────────────────────────────────────────
export const DB = {
    get(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        // Dispatch event for reactive updates across components without full reload
        window.dispatchEvent(new Event('local-storage-update'));
    },
    getOne(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch { return null; }
    },
    setOne(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        window.dispatchEvent(new Event('local-storage-update'));
    },
    remove(key) {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event('local-storage-update'));
    },
};



// ── Generic helpers ──────────────────────────────────────────

// ── ID generator ─────────────────────────────────────────────
export function genId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

// ── Users ─────────────────────────────────────────────────────
export const Users = {
    all() { return DB.get(DB_KEYS.users); },
    find(id) { return this.all().find(u => u.id === id); },
    findByEmail(email) { return this.all().find(u => u.email.toLowerCase() === email.toLowerCase()); },
    add(user) {
        const users = this.all();
        users.push(user);
        DB.set(DB_KEYS.users, users);
    },
    update(id, patch) {
        const users = this.all().map(u => u.id === id ? { ...u, ...patch } : u);
        DB.set(DB_KEYS.users, users);
    },
    remove(id) {
        DB.set(DB_KEYS.users, this.all().filter(u => u.id !== id));
    },
    byRole(role) { return this.all().filter(u => u.role === role); },
};

// ── Session ───────────────────────────────────────────────────
export const Session = {
    get() { return DB.getOne(DB_KEYS.session); },
    set(data) { DB.setOne(DB_KEYS.session, data); },
    clear() { DB.remove(DB_KEYS.session); },
    currentUser() {
        const s = this.get();
        return s ? Users.find(s.id) : null;
    },
};

// ── Issues ────────────────────────────────────────────────────
export const Issues = {
    all() { return DB.get(DB_KEYS.issues); },
    find(id) { return this.all().find(i => i.id === id); },
    byCitizen(citizenId) { return this.all().filter(i => i.citizenId === citizenId); },
    byConstituency(constituency) {
        if (!constituency || constituency === 'General') return this.all(); // Return all if no valid constituency
        return this.all().filter(i => !i.constituency || i.constituency === constituency || i.constituency === 'General');
    },
    add(issue) {
        const issues = this.all();
        issues.push(issue);
        DB.set(DB_KEYS.issues, issues);
    },
    update(id, patch) {
        const issues = this.all().map(i => i.id === id ? { ...i, ...patch } : i);
        DB.set(DB_KEYS.issues, issues);
    },
    remove(id) {
        DB.set(DB_KEYS.issues, this.all().filter(i => i.id !== id));
    },
};

// ── Responses (threaded on issues) ───────────────────────────
export const Responses = {
    all() { return DB.get(DB_KEYS.responses); },
    forIssue(issueId) { return this.all().filter(r => r.issueId === issueId); },
    add(resp) {
        const responses = this.all();
        responses.push(resp);
        DB.set(DB_KEYS.responses, responses);
    },
    remove(id) {
        DB.set(DB_KEYS.responses, this.all().filter(r => r.id !== id));
    },
};

// ── Announcements ─────────────────────────────────────────────
export const Announcements = {
    all() { return DB.get(DB_KEYS.announcements); },
    find(id) { return this.all().find(a => a.id === id); },
    byPolitician(polId) { return this.all().filter(a => a.politicianId === polId); },
    add(ann) {
        const anns = this.all();
        anns.push(ann);
        DB.set(DB_KEYS.announcements, anns);
    },
    remove(id) {
        DB.set(DB_KEYS.announcements, this.all().filter(a => a.id !== id));
    },
    update(id, patch) {
        const anns = this.all().map(a => a.id === id ? { ...a, ...patch } : a);
        DB.set(DB_KEYS.announcements, anns);
    }
};

// ── Flags (moderation) ────────────────────────────────────────
export const Flags = {
    all() { return DB.get(DB_KEYS.flags); },
    pending() { return this.all().filter(f => f.status === 'pending'); },
    add(flag) {
        const flags = this.all();
        flags.push(flag);
        DB.set(DB_KEYS.flags, flags);
    },
    update(id, patch) {
        const flags = this.all().map(f => f.id === id ? { ...f, ...patch } : f);
        DB.set(DB_KEYS.flags, flags);
    },
};

// ── Notifications ─────────────────────────────────────────────
export const Notifications = {
    all() { return DB.get(DB_KEYS.notifications); },
    forUser(userId) { return this.all().filter(n => n.userId === userId); },
    add(notif) {
        const notifs = this.all();
        notifs.push(notif);
        DB.set(DB_KEYS.notifications, notifs);
    },
    markRead(userId) {
        const notifs = this.all().map(n => n.userId === userId ? { ...n, read: true } : n);
        DB.set(DB_KEYS.notifications, notifs);
    },
};

// ── Seed demo data ────────────────────────────────────────────
export function seedIfEmpty() {
    if (Users.all().length > 0) return; // already seeded

    const now = Date.now();
    const adminId = genId();
    const polId1 = genId();
    const polId2 = genId();
    const citId1 = genId();
    const citId2 = genId();
    const modId = genId();

    const demoUsers = [
        { id: adminId, name: 'Admin User', email: 'admin@civic.gov', password: 'password', role: 'admin', constituency: '', active: true, joined: now - 864e5 * 30 },
        { id: polId1, name: 'Jane Mitchell', email: 'jane@politics.gov', password: 'password', role: 'politician', constituency: 'North Ward', active: true, joined: now - 864e5 * 25 },
        { id: polId2, name: 'Robert Okafor', email: 'robert@senate.gov', password: 'password', role: 'politician', constituency: 'South Ward', active: true, joined: now - 864e5 * 20 },
        { id: citId1, name: 'Alice Thompson', email: 'citizen@civic.gov', password: 'password', role: 'citizen', constituency: 'North Ward', active: true, joined: now - 864e5 * 10 },
        { id: citId2, name: 'David Chen', email: 'david@civic.gov', password: 'password', role: 'citizen', constituency: 'South Ward', active: true, joined: now - 864e5 * 8 },
        { id: modId, name: 'Moderator Sam', email: 'mod@civic.gov', password: 'password', role: 'moderator', constituency: '', active: true, joined: now - 864e5 * 15 },
    ];
    demoUsers.forEach(u => Users.add(u));

    const iss1Id = genId(), iss2Id = genId(), iss3Id = genId(), iss4Id = genId();
    const demoIssues = [
        { id: iss1Id, title: 'Pothole on Maple Street', category: 'Infrastructure', description: 'Large pothole outside No. 42 Maple Street causing damage to vehicles. Needs urgent repair.', citizenId: citId1, citizenName: 'Alice Thompson', constituency: 'North Ward', status: 'in-progress', votes: 14, timestamp: now - 864e5 * 5, flagged: false },
        { id: iss2Id, title: 'Poor lighting in Park Lane', category: 'Safety', description: 'The streetlights in Park Lane have been out for 3 weeks. The area is dangerous for pedestrians at night.', citizenId: citId1, citizenName: 'Alice Thompson', constituency: 'North Ward', status: 'open', votes: 22, timestamp: now - 864e5 * 3, flagged: false },
        { id: iss3Id, title: 'Overfull rubbish bins near school', category: 'Environment', description: 'Bins outside Westside Primary have not been collected in two weeks. Health hazard.', citizenId: citId2, citizenName: 'David Chen', constituency: 'South Ward', status: 'resolved', votes: 8, timestamp: now - 864e5 * 12, flagged: false },
        { id: iss4Id, title: 'Water supply cut for 3 days', category: 'Health', description: 'Our block (34–56 River Road) has had no running water since Monday. No update from utilities.', citizenId: citId2, citizenName: 'David Chen', constituency: 'South Ward', status: 'open', votes: 31, timestamp: now - 864e5 * 1, flagged: false },
    ];
    demoIssues.forEach(i => Issues.add(i));

    const demoResponses = [
        { id: genId(), issueId: iss1Id, authorId: polId1, authorName: 'Jane Mitchell', authorRole: 'politician', content: 'Thank you for reporting this. I have raised a council order this morning — the repair crew will be on-site within 48 hours.', timestamp: now - 864e5 * 4, flagged: false },
        { id: genId(), issueId: iss1Id, authorId: citId1, authorName: 'Alice Thompson', authorRole: 'citizen', content: 'Thank you, Minister Mitchell! Really appreciate the quick response.', timestamp: now - 864e5 * 3.5, flagged: false },
        { id: genId(), issueId: iss3Id, authorId: polId2, authorName: 'Robert Okafor', authorRole: 'politician', content: 'This has been escalated to the sanitation department. Bins have now been collected and the schedule has been updated.', timestamp: now - 864e5 * 10, flagged: false },
    ];
    demoResponses.forEach(r => Responses.add(r));

    const demoAnnouncements = [
        { id: genId(), title: 'Town Hall Meeting — 1 March 2026', content: 'I will be hosting an open town hall at the North Ward Community Centre on Saturday 1 March at 10 AM. All residents are welcome to attend and raise concerns directly.', politicianId: polId1, politicianName: 'Jane Mitchell', constituency: 'North Ward', timestamp: now - 864e5 * 2, likes: 34 },
        { id: genId(), title: 'New Bus Route Approved for South Ward', content: 'I am pleased to announce that the council has approved a new bus route (Route 57) connecting River Road to the city centre. Service begins 15 March. This follows months of advocacy based on resident feedback.', politicianId: polId2, politicianName: 'Robert Okafor', constituency: 'South Ward', timestamp: now - 864e5 * 1, likes: 58 },
    ];
    demoAnnouncements.forEach(a => Announcements.add(a));

    const demoFlags = [
        { id: genId(), targetId: iss2Id, targetType: 'issue', reason: 'Possible duplicate report', status: 'pending', raisedBy: citId2, raisedAt: now - 864e5 * 0.5 },
    ];
    demoFlags.forEach(f => Flags.add(f));
}

// ── Notifications ─────────────────────────────────────────────

// ── Seed demo data ────────────────────────────────────────────

// ── Format date helper ────────────────────────────────────────
export function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(ts).toLocaleDateString();
}

export function formatDate(ts) {
    return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
