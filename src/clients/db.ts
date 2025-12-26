import prisma from "@/clients/prisma";
import { PaymentMethod, Product, Sale, SaleItem } from "@/utils/types";

export async function getProductByBarcode(
  barCode: string
): Promise<Product | undefined> {
  const product = await prisma.product.findFirst({
    where: { barCode },
  });
  if (product) {
    return product;
  }
  return undefined;
}

export async function createProductSaleItems(saleId: string, items: SaleItem[]): Promise<SaleItem[] | undefined> {
  await prisma.$transaction(async (prisma) => {
    for (const item of items) {
      await prisma.saleProduct.create({
        data: {
          saleId,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }
  });
  return items;
}

export async function createSale(total: number, amountReceived: number, change: number, sellerId: number, paymentMethod: PaymentMethod): Promise<Sale> {
  return await prisma.sale.create({
    data: {
      total,
      seller: { connect: { id: sellerId } },
      amountReceived,
      change,
      paymentMethod,
      status: "CONCLUDED",
    },
  });
}