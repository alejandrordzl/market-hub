import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAuthenticatedUser, isAdmin } from '@/lib/auth';

// PUT /api/v1/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing user ID' },
      { status: 400 }
    );
  }

  const userId = Number(id);
  if (isNaN(userId)) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    );
  }

  try {
    const authUser = getAuthenticatedUser(request);

    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone, role, active } = body;

    // Fetch the user to be updated
    const userToUpdate = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToUpdate) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Authorization rules for updating
    if (userToUpdate.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Updating SUPER_ADMIN users is not allowed' },
        { status: 403 }
      );
    }

    if (authUser.role === 'ADMIN' && userToUpdate.role !== 'USER') {
      return NextResponse.json(
        { error: 'Admins can only update users with the USER role' },
        { status: 403 }
      );
    }

    // Update the user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(active && { active }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/users/[id] - Soft delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing user ID' },
      { status: 400 }
    );
  }

  const userId = Number(id);
  if (isNaN(userId)) {
    return NextResponse.json(
      { error: 'Invalid user ID' },
      { status: 400 }
    );
  }

  try {
    const authUser = getAuthenticatedUser(request);

    if (!isAdmin(authUser)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Fetch the user to be "deleted"
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Authorization rules for soft deletion
    if (userToDelete.role === 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Deleting SUPER_ADMIN users is not allowed' },
        { status: 403 }
      );
    }

    if (authUser.role === 'ADMIN' && userToDelete.role !== 'USER') {
      return NextResponse.json(
        { error: 'Admins can only delete users with the USER role' },
        { status: 403 }
      );
    }

    // Soft delete the user by setting their status to INACTIVE
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        active: 'INACTIVE',
      },
    });

    return NextResponse.json({
      message: 'User status updated to INACTIVE',
      user: updatedUser,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
