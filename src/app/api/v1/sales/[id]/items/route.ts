import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { saleProducts, sales } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const [saleProduct] = await db
      .insert(saleProducts)
      .values({
        saleId: id,
        productId,
        quantity,
      })
      .returning();

    const saleProductWithProduct = await db.query.saleProducts.findFirst({
      where: eq(saleProducts.id, saleProduct.id),
      with: {
        product: true,
      },
    });

    const currentSale = await db.query.sales.findFirst({
      where: eq(sales.id, id),
    });

    if (currentSale && saleProductWithProduct?.product) {
      const [sale] = await db
        .update(sales)
        .set({
          total: currentSale.total + (quantity * saleProductWithProduct.product.price),
        })
        .where(eq(sales.id, id))
        .returning();

      return NextResponse.json({ saleProduct: saleProductWithProduct, sale }, { status: 201 });
    } else {
      return NextResponse.json({ saleProduct: saleProductWithProduct }, { status: 201 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
