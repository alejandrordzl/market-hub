import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// POST /api/v1/sales/[id]/items - Add item to sale
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id || typeof id !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing sale ID' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const saleProduct = await prisma.saleProduct.create({
      data: {
        saleId: id,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        total: {
          increment: quantity * saleProduct.product.price,
        },
      },
    });

    return NextResponse.json({ saleProduct, sale }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
