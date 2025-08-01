import { NextRequest } from 'next/server';
import { Role } from '@/utils/types';

export interface AuthenticatedUser {
  id: number;
  role: Role;
  name: string;
  email: string;
}

// Helper para obtener usuario del middleware global
export function getAuthenticatedUser(request: NextRequest): AuthenticatedUser {
  return {
    id: parseInt(request.headers.get('x-user-id') || '0'),
    role: (request.headers.get('x-user-role') || 'USER') as Role,
    name: request.headers.get('x-user-name') || 'Unknown',
    email: request.headers.get('x-user-email') || '',
  };
}

// Helper para verificar roles específicos
export function requireRole(user: AuthenticatedUser, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(user.role);
}

// Helpers de conveniencia
export function isAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'ADMIN' || user.role === 'SUPER_ADMIN';
}

export function isSuperAdmin(user: AuthenticatedUser): boolean {
  return user.role === 'SUPER_ADMIN';
}
