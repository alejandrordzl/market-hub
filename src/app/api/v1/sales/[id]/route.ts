import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { sales } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
    const sale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
      with: {
        saleProducts: {
          with: {
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

    const [updatedSale] = await db
      .update(sales)
      .set({
        paymentMethod: paymentMethod as 'CASH' | 'CREDIT_CARD',
        amountReceived,
        change,
        status: 'CONCLUDED',
      })
      .where(eq(sales.id, id))
      .returning();

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
