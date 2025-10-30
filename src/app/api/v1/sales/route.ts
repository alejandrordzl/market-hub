import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { sales } from '@/db/schema';
import { eq, gte, lte, count, and, SQL } from 'drizzle-orm';
import { getAuthenticatedUser } from '@/lib/auth';

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
    
    // Build where conditions
    const conditions: SQL[] = [eq(sales.status, status as 'PENDING' | 'CONCLUDED' | 'CANCELLED')];
    
    if (startDate) {
      conditions.push(gte(sales.saleDate, new Date(startDate)));
    }
    
    if (endDate) {
      conditions.push(lte(sales.saleDate, new Date(endDate)));
    }
    
    if (sellerId) {
      conditions.push(eq(sales.sellerId, parseInt(sellerId, 10)));
    }

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const salesData = await db.query.sales.findMany({
      where: whereClause,
      with: {
        seller: true,
        saleProducts: true,
      },
      limit,
      offset: skip,
    });

    const [{ count: totalSales }] = await db
      .select({ count: count() })
      .from(sales)
      .where(whereClause);

    return NextResponse.json({
      sales: salesData,
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
    const [newSale] = await db
      .insert(sales)
      .values({
        id: crypto.randomUUID(),
        sellerId: user.id,
        status: 'PENDING',
        total: 0,
        amountReceived: 0,
        paymentMethod: 'CASH',
        change: 0,
      })
      .returning();

    return NextResponse.json(newSale, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
