import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// GET /api/v1/products - Get products with pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters' },
      { status: 400 }
    );
  }

  try {
    const products = await prisma.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { active: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    const totalProducts = await prisma.product.count({
      where: { active: 'ACTIVE' },
    });

    return NextResponse.json({
      data: products,
      meta: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
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

// POST /api/v1/products - Create a new product
export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);

  try {
    const body = await request.json();
    const { name, barCode, price } = body;

    if (!name || !barCode || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name,
        barCode,
        price,
        createdBy: user.id,
        updatedBy: user.id,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
