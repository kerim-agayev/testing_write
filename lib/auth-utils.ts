import { auth } from '@/lib/auth';
import type { UserRole } from '@prisma/client';

export async function getSessionUser() {
  const session = await auth();
  if (!session?.user) return null;
  return session.user;
}

export async function requireAuth() {
  const user = await getSessionUser();
  if (!user) {
    throw new AuthError('UNAUTHORIZED', 'Authentication required');
  }
  return user;
}

export async function requireRole(role: UserRole | UserRole[]) {
  const user = await requireAuth();
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(user.role)) {
    throw new AuthError('FORBIDDEN', 'Insufficient permissions');
  }
  return user;
}

export class AuthError extends Error {
  code: string;
  statusCode: number;

  constructor(code: 'UNAUTHORIZED' | 'FORBIDDEN', message: string) {
    super(message);
    this.code = code;
    this.statusCode = code === 'UNAUTHORIZED' ? 401 : 403;
  }
}

export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return Response.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  console.error('Unexpected auth error:', error);
  return Response.json(
    { error: 'Internal server error', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
