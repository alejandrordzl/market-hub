import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

// GET /api/v1/sales/[id] - Get sale by ID
export async function GET(
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
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        saleProducts: {
          include: {
            product: true,
          },
        },
        seller: true,
      },
    });

    if (!sale) {
      return NextResponse.json(
        { error: 'Sale not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(sale);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/v1/sales/[id] - Update sale (finalize checkout)
export async function PUT(
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
    const { paymentMethod, amountReceived, change } = body;

    if (!paymentMethod || amountReceived === undefined || change === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updatedSale = await prisma.sale.update({
      where: { id },
      data: {
        paymentMethod,
        amountReceived,
        change,
        status: 'CONCLUDED',
      },
    });

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
