import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// GET /api/v1/products/code/[barCode] - Search product by barCode
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ barCode: string }> }
) {
  const { barCode } = await params;
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!barCode || typeof barCode !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing barCode parameter' },
      { status: 400 }
    );
  }

  if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
    return NextResponse.json(
      { error: 'Invalid pagination parameters' },
      { status: 400 }
    );
  }

  try {
    const products = await prisma.product.findMany({
      where: { barCode },
      skip: (page - 1) * limit,
      take: limit,
    });

    const totalProducts = await prisma.product.count({
      where: { barCode },
    });

    if (products.length === 0) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

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
