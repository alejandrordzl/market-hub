import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// GET /api/v1/sales - Get sales with filtering and pagination
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const sellerId = searchParams.get('sellerId');
  const status = searchParams.get('status') || 'CONCLUDED';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const skip = (page - 1) * limit;
    const where = {
      status,
      ...(startDate && { saleDate: { gte: new Date(startDate) } }),
      ...(endDate && { saleDate: { lte: new Date(endDate) } }),
      ...(sellerId && { sellerId: parseInt(sellerId, 10) }),
    } as Prisma.saleWhereInput;

    const sales = await prisma.sale.findMany({
      where,
      include: { seller: true, saleProducts: true },
      skip,
      take: limit,
    });

    const totalSales = await prisma.sale.count({ where });

    return NextResponse.json({
      sales,
      pagination: {
        total: totalSales,
        page,
        limit,
        totalPages: Math.ceil(totalSales / limit),
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

// POST /api/v1/sales - Create a new sale
export async function POST(request: NextRequest) {
  const user = getAuthenticatedUser(request);
  try {
    const newSale = await prisma.sale.create({
      data: {
        sellerId: user.id,
        status: 'PENDING',
        total: 0,
        amountReceived: 0,
        paymentMethod: 'CASH',
        change: 0,
      },
    });

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
