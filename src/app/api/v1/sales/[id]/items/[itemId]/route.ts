import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { saleProducts, sales } from '@/db/schema';
import { eq } from 'drizzle-orm';

// PUT /api/v1/sales/[id]/items/[itemId] - Update sale item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;

  if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing IDs' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined || !quantity) {
      return NextResponse.json(
        { error: 'Quantity value is not defined' },
        { status: 400 }
      );
    }

    const saleProduct = await db.query.saleProducts.findFirst({
      where: eq(saleProducts.id, itemId),
      with: { product: true },
    });

    if (!saleProduct) {
      return NextResponse.json(
        { error: 'Sale item not found' },
        { status: 404 }
      );
    }

    const updateData: Partial<typeof saleProducts.$inferInsert> = {};
    if (quantity) updateData.quantity = quantity;

    const [updatedProductSaleItem] = await db
      .update(saleProducts)
      .set(updateData)
      .where(eq(saleProducts.id, itemId))
      .returning();

    return NextResponse.json({ updatedProductSaleItem });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/sales/[id]/items/[itemId] - Remove item from sale
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  const { id, itemId } = await params;

  if (!id || typeof id !== 'string' || !itemId || typeof itemId !== 'string') {
    return NextResponse.json(
      { error: 'Invalid or missing IDs' },
      { status: 400 }
    );
  }

  try {
    const saleItem = await db.query.saleProducts.findFirst({
      where: eq(saleProducts.id, itemId),
      with: { product: true, sale: true },
    });

    if (!saleItem) {
      return NextResponse.json(
        { error: 'Sale item not found' },
        { status: 404 }
      );
    }

    await db
      .delete(saleProducts)
      .where(eq(saleProducts.id, itemId));

    const currentSale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
    });

    if (currentSale && saleItem.product) {
      const [sale] = await db
        .update(sales)
        .set({
          total: currentSale.total - (saleItem.quantity * saleItem.product.price),
        })
        .where(eq(sales.id, id))
        .returning();

      return NextResponse.json({
        message: 'Item removed successfully',
        sale,
      });
    } else {
      return NextResponse.json({
        message: 'Item removed successfully',
      });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
