import { Users, Session, genId } from './data';

export function login(email, password) {
    const user = Users.findByEmail(email);
    if (!user) return { ok: false, error: 'No account found with that email.' };
    if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
    if (!user.active) return { ok: false, error: 'Your account has been deactivated. Please contact an admin.' };
    Session.set({ id: user.id, role: user.role });
    return { ok: true, role: user.role, user };
}

export function register(name, email, password, role, constituency) {
    if (Users.findByEmail(email)) return { ok: false, error: 'An account with this email already exists.' };
    if (!name || !email || !password || !role) return { ok: false, error: 'Please fill all required fields.' };
    if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
    const newUser = {
        id: genId(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        constituency: constituency || '',
        active: true,
        joined: Date.now(),
    };
    Users.add(newUser);
    Session.set({ id: newUser.id, role: newUser.role });
    return { ok: true, role: newUser.role, user: newUser };
}

export function logout() {
    Session.clear();
}
