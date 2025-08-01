import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/utils/prisma';
import { getAuthenticatedUser, isAdmin, isSuperAdmin } from '@/lib/auth';

// GET /api/v1/users - Get users with pagination
export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);

    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    const users = await prisma.user.findMany({
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const totalUsers = await prisma.user.count();

    return NextResponse.json({
      data: users,
      meta: {
        total: totalUsers,
        page,
        limit,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/v1/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthenticatedUser(request);

    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, role } = body;

    if (!name || !email || !password || !phone || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role creation permissions
    if (role === 'ADMIN' && !isSuperAdmin(authUser)) {
      return NextResponse.json(
        { error: 'Only SUPER_ADMIN can create ADMIN users' },
        { status: 403 }
      );
    }

    if (role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Creating SUPER_ADMIN users is not allowed' },
        { status: 403 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role,
        active: 'ACTIVE',
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
