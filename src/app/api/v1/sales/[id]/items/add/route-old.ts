import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { products, sales, saleProducts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// POST /api/v1/sales/[id]/items/add - Add item to sale by barcode
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: saleId } = await params;

  if (!saleId || typeof saleId !== "string") {
    return NextResponse.json(
      { error: "Invalid or missing sale ID" },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const { barCode } = body;

    if (!barCode || typeof barCode !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid barCode" },
        { status: 400 }
      );
    }

    // Single optimized query to get all needed data at once
    const [productResult, saleResult, existingSaleProductResult] = await Promise.all([
      db.query.products.findFirst({
        where: and(
          eq(products.barCode, barCode.trim()), // Use eq instead of ilike for exact match (faster)
          eq(products.active, "ACTIVE")
        ),
        columns: {
          id: true,
          price: true,
          name: true, // Include name for better error messages if needed
        },
      }),
      db.query.sales.findFirst({
        where: and(
          eq(sales.id, saleId),
          eq(sales.status, "PENDING") // Pre-filter by status to avoid extra check
        ),
        columns: {
          id: true,
          status: true,
          total: true, // Get current total to avoid extra query in transaction
        },
      }),
      // Query existing sale product in parallel
      db.query.saleProducts.findFirst({
        where: eq(saleProducts.saleId, saleId),
        columns: {
          id: true,
          quantity: true,
          productId: true,
        },
      }),
    ]);

    if (!productResult) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    if (!saleResult) {
      return NextResponse.json(
        { error: "Sale not found or not in pending status" },
        { status: 404 }
      );
    }

    // Check if this specific product is already in the sale
    const existingSaleProduct = existingSaleProductResult?.productId === productResult.id 
      ? existingSaleProductResult 
      : await db.query.saleProducts.findFirst({
          where: and(
            eq(saleProducts.saleId, saleId),
            eq(saleProducts.productId, productResult.id)
          ),
          columns: {
            id: true,
            quantity: true,
          },
        });

    // Use a transaction to ensure atomicity - optimized to avoid extra query
    await db.transaction(async (tx) => {
      if (existingSaleProduct) {
        // If product already exists in sale, increment quantity by 1
        await tx
          .update(saleProducts)
          .set({
            quantity: existingSaleProduct.quantity + 1,
          })
          .where(eq(saleProducts.id, existingSaleProduct.id));
      } else {
        // If product doesn't exist in sale, create new sale product with quantity 1
        await tx
          .insert(saleProducts)
          .values({
            id: crypto.randomUUID(),
            saleId: saleId,
            productId: productResult.id,
            quantity: 1,
          });
      }

      // Update sale total by adding the product price - use cached total
      await tx
        .update(sales)
        .set({
          total: saleResult.total + productResult.price,
        })
        .where(eq(sales.id, saleId));
    });

    return NextResponse.json(
      {
        message: existingSaleProduct
          ? "Product quantity increased successfully"
          : "Product added to sale successfully",
      },
      { status: existingSaleProduct ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error adding item to sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
