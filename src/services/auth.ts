import { apiRequest } from './api';

export interface AuthUser {
  id?: string;
  name: string;
  email: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
}

export interface RegisteredUser {
  id?: string;
  name: string;
  email: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignUpPayload extends LoginPayload {
  name: string;
}

export function login(payload: LoginPayload) {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function signUp(payload: SignUpPayload) {
  return apiRequest<RegisteredUser>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
