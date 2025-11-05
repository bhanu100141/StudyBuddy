import bcrypt from 'bcryptjs';
import { prisma } from '@/backend/lib/prisma';
import { signToken } from '@/backend/lib/jwt';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: 'STUDENT' | 'TEACHER';
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthController {
  static async register(data: RegisterData) {
    try {
      const { email, password, name, role } = data;

      if (!email || !password || !name || !role) {
        throw new Error('Missing required fields');
      }

      if (!['STUDENT', 'TEACHER'].includes(role)) {
        throw new Error('Invalid role. Must be STUDENT or TEACHER');
      }

      console.log('Checking for existing user:', email);
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      console.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log('Creating user in database...');
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role,
        },
      });
      console.log('User created successfully:', user.id);

      const token = signToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      return {
        message: 'User created successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(data: LoginData) {
    const { email, password } = data;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
