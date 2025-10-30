import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";

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

    // Parallel queries to reduce latency
    const [product, sale] = await Promise.all([
      prisma.product.findFirst({
        where: {
          barCode: barCode.trim(),
          active: "ACTIVE",
        },
      }),
      prisma.sale.findUnique({
        where: { id: saleId },
        select: {
          id: true,
          status: true,
        },
      }),
    ]);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found or inactive" },
        { status: 404 }
      );
    }

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    // Check if the sale is still pending (not concluded or cancelled)
    if (sale.status !== "PENDING") {
      return NextResponse.json(
        { error: "Cannot add items to a sale that is not pending" },
        { status: 400 }
      );
    }

    // Check if this product is already in the sale
    const existingSaleProduct = await prisma.saleProduct.findFirst({
      where: {
        saleId: saleId,
        productId: product.id,
      },
      select: {
        id: true,
        quantity: true,
      },
    });

    // Use a transaction to ensure atomicity and reduce database round trips
    await prisma.$transaction(async (tx) => {
      const promises = [];
      if (existingSaleProduct) {
        // If product already exists in sale, increment quantity by 1
        promises.push(
          tx.saleProduct.update({
            where: { id: existingSaleProduct.id },
            data: {
              quantity: existingSaleProduct.quantity + 1,
            },
          })
        );
      } else {
        // If product doesn't exist in sale, create new sale product with quantity 1
        promises.push(
          tx.saleProduct.create({
            data: {
              saleId: saleId,
              productId: product.id,
              quantity: 1,
            },
          })
        );
      }

      // Update sale total by adding the product price and get complete sale data
      promises.push(
        tx.sale.update({
          where: { id: saleId },
          data: {
            total: {
              increment: product.price,
            },
          },
        })
      );
      await Promise.all(promises);
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
