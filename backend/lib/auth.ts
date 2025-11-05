import { NextRequest } from 'next/server';
import { verifyToken, JWTPayload } from './jwt';

export const getUserFromRequest = (request: NextRequest): JWTPayload | null => {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
};

export const requireAuth = (request: NextRequest): JWTPayload => {
  const user = getUserFromRequest(request);

  if (!user) {
    throw new Error('Unauthorized');
  }

  return user;
};

export const requireTeacher = (request: NextRequest): JWTPayload => {
  const user = requireAuth(request);

  if (user.role !== 'TEACHER') {
    throw new Error('Forbidden: Teacher access required');
  }

  return user;
};
