import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { products, sales, saleProducts } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";

// POST /api/v1/sales/[id]/items/add - Add item to sale by barcode (Ultra-optimized version)
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

    const trimmedBarCode = barCode.trim();

    // Ultra-optimized: Single query using CTE to get all needed data
    const result = await db.execute(sql`
      WITH product_data AS (
        SELECT id, price, name
        FROM product 
        WHERE "barCode" = ${trimmedBarCode} AND active = 'ACTIVE'
        LIMIT 1
      ),
      sale_data AS (
        SELECT id, total, status
        FROM sale 
        WHERE id = ${saleId} AND status = 'PENDING'
        LIMIT 1
      ),
      existing_sale_product AS (
        SELECT sp.id, sp.quantity
        FROM "saleProduct" sp
        INNER JOIN product_data pd ON sp."productId" = pd.id
        WHERE sp."saleId" = ${saleId}
        LIMIT 1
      )
      SELECT 
        pd.id as product_id,
        pd.price as product_price,
        pd.name as product_name,
        sd.id as sale_id,
        sd.total as sale_total,
        sd.status as sale_status,
        esp.id as existing_sale_product_id,
        esp.quantity as existing_quantity
      FROM product_data pd
      CROSS JOIN sale_data sd
      LEFT JOIN existing_sale_product esp ON true
    `);

    if (result.rows.length === 0) {
      // Check which one failed
      const productExists = await db.query.products.findFirst({
        where: and(
          eq(products.barCode, trimmedBarCode),
          eq(products.active, "ACTIVE")
        ),
        columns: { id: true }
      });

      if (!productExists) {
        return NextResponse.json(
          { error: "Product not found or inactive" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: "Sale not found or not in pending status" },
        { status: 404 }
      );
    }

    const data = result.rows[0];
    const isExistingProduct = !!data.existing_sale_product_id;

    // Single transaction with optimized UPSERT pattern
    await db.transaction(async (tx) => {
      if (isExistingProduct) {
        // Update existing sale product quantity
        await tx.execute(sql`
          UPDATE "saleProduct" 
          SET quantity = quantity + 1
          WHERE id = ${data.existing_sale_product_id}
        `);
      } else {
        // Insert new sale product
        await tx.execute(sql`
          INSERT INTO "saleProduct" (id, "saleId", "productId", quantity)
          VALUES (gen_random_uuid(), ${saleId}, ${data.product_id}, 1)
        `);
      }

      // Update sale total
      await tx.execute(sql`
        UPDATE sale 
        SET total = total + ${data.product_price}
        WHERE id = ${saleId}
      `);
    });

    return NextResponse.json(
      {
        message: isExistingProduct
          ? "Product quantity increased successfully"
          : "Product added to sale successfully",
      },
      { status: isExistingProduct ? 200 : 201 }
    );
  } catch (error) {
    console.error("Error adding item to sale:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}