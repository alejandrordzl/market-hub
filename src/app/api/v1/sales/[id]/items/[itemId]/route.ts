import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';

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

    const saleProduct = await prisma.saleProduct.findUnique({
      where: { id: itemId },
      include: { product: true },
    });
    const isAdding = quantity > saleProduct?.quantity!;
    if (!saleProduct) {
      return NextResponse.json(
        { error: 'Sale item not found' },
        { status: 404 }
      );
    }
    const updatedProductSaleItem = await prisma.$transaction(async (tx) => {
      const updatedItem = await tx.saleProduct.update({
        where: { id: itemId },
        data: {
          ...(quantity && { quantity }),
        },
      });
      if(isAdding) {
        await tx.sale.update({
          where: { id },
          data: {
            total: {
              increment: (quantity - saleProduct.quantity) * saleProduct.product.price,
            },
          },
        });
      } else {
        await tx.sale.update({
          where: { id },
          data: {
            total: {
              decrement: (saleProduct.quantity - quantity) * saleProduct.product.price,
            },
          },
        });
      }
      
      return updatedItem;
    });

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
    const saleItem = await prisma.saleProduct.findUnique({
      where: { id: itemId },
      include: { product: true, sale: true },
    });

    if (!saleItem) {
      return NextResponse.json(
        { error: 'Sale item not found' },
        { status: 404 }
      );
    }

    await prisma.saleProduct.delete({
      where: { id: itemId },
    });

    const sale = await prisma.sale.update({
      where: { id },
      data: {
        total: {
          decrement: saleItem.quantity * saleItem.product.price,
        },
      },
    });

    return NextResponse.json({
      message: 'Item removed successfully',
      sale,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
