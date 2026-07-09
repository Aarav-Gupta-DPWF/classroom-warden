/**
 * Fallback auth when Supabase env vars are not set (local dev only).
 * Passwords are hashed with SHA-256 before storage — not for production at scale.
 */

const USERS_KEY = 'cw-auth-users';
const SESSION_KEY = 'cw-auth-session';

export interface LocalUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  school: string;
  createdAt: string;
}

export interface LocalSession {
  userId: string;
  email: string;
  fullName: string;
  school: string;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function loadUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(session: LocalSession | null) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

export function getLocalSession(): LocalSession | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
}

export async function localSignUp(
  email: string,
  password: string,
  fullName: string,
  school: string,
): Promise<{ session: LocalSession }> {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  if (users.some((u) => u.email === normalized)) {
    throw new Error('An account with this email already exists.');
  }
  const passwordHash = await hashPassword(password);
  const user: LocalUser = {
    id: crypto.randomUUID(),
    email: normalized,
    passwordHash,
    fullName: fullName.trim(),
    school: school.trim(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  saveUsers(users);
  const session: LocalSession = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    school: user.school,
  };
  saveSession(session);
  return { session };
}

export async function localSignIn(
  email: string,
  password: string,
): Promise<{ session: LocalSession }> {
  const normalized = email.trim().toLowerCase();
  const users = loadUsers();
  const user = users.find((u) => u.email === normalized);
  if (!user) throw new Error('No account found for this email.');
  const passwordHash = await hashPassword(password);
  if (user.passwordHash !== passwordHash) throw new Error('Incorrect password.');
  const session: LocalSession = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    school: user.school,
  };
  saveSession(session);
  return { session };
}

export function localSignOut() {
  saveSession(null);
}
