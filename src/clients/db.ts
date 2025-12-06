import prisma from "@/clients/prisma";
import { Product } from "@/utils/types";

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
