import { NextRequest, NextResponse } from 'next/server';
import db from '@/db';
import { products } from '@/db/schema';
import { eq, count, desc } from 'drizzle-orm';
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
    const productList = await db
      .select()
      .from(products)
      .where(eq(products.active, 'ACTIVE'))
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [{ count: totalProducts }] = await db
      .select({ count: count() })
      .from(products)
      .where(eq(products.active, 'ACTIVE'));

    return NextResponse.json({
      data: productList,
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

    const [newProduct] = await db
      .insert(products)
      .values({
        name,
        barCode,
        price,
        createdBy: user.id,
        updatedBy: user.id,
      })
      .returning();

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
