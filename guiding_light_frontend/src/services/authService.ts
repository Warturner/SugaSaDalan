import type { User } from '../types';
import { apiFetch } from './api';

export type SessionInvalidReason =
  | 'session_replaced'
  | 'session_expired'
  | 'account_deleted'
  | 'authentication_required'
  | null;

export interface SessionResponse {
  success: boolean;
  authenticated: boolean;
  user: User | null;
  reason?: SessionInvalidReason;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export function checkSession() {
  return apiFetch<SessionResponse>('check_session.php');
}

export function loginUser(username: string, password: string) {
  return apiFetch<LoginResponse>('login.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
}

export function logoutUser() {
  return apiFetch<{ success: boolean; message: string }>('logout.php', {
    method: 'POST'
  });
}
