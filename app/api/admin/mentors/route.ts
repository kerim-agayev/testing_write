import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { requireRole, handleAuthError } from '@/lib/auth-utils';
import { prisma } from '@/lib/prisma';
import { CreateMentorSchema } from '@/lib/validations/mentor';

// GET /api/admin/mentors — list all mentors
export async function GET() {
  try {
    await requireRole('ADMIN');

    const mentors = await prisma.user.findMany({
      where: { role: 'MENTOR' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { mentorAssignments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(mentors);
  } catch (error) {
    return handleAuthError(error);
  }
}

// POST /api/admin/mentors — admin creates mentor account
export async function POST(req: Request) {
  try {
    await requireRole('ADMIN');
    const body = await req.json();
    const parsed = CreateMentorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email already registered', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const mentor = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'MENTOR',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(mentor, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
