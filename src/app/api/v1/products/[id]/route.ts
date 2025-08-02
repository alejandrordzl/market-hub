import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAuthenticatedUser, isAdmin } from '@/lib/auth';

// GET /api/v1/products/[id] - Get product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing product ID' },
      { status: 400 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/products/[id] - Update product by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getAuthenticatedUser(request);

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing product ID' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { name, barCode, price } = body;

    if (!name && !barCode && price === undefined) {
      return NextResponse.json(
        { error: 'Missing fields to update' },
        { status: 400 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(barCode && { barCode }),
        ...(price !== undefined && { price }),
        updatedBy: user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/products/[id] - Soft delete product (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = getAuthenticatedUser(request);

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing product ID' },
      { status: 400 }
    );
  }

  // Verificar permisos de admin
  if (!isAdmin(user)) {
    return NextResponse.json(
      { error: 'Forbidden - Admin access required' },
      { status: 403 }
    );
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        active: 'INACTIVE',
        updatedBy: user.id,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Product deleted successfully',
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
