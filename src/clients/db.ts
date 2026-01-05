import prisma from "@/clients/prisma";
import { PaymentMethod, Product, Sale, SaleItem } from "@/utils/types";
import { revalidateTag, unstable_cache } from "next/cache";

export async function getProductByBarcode(
  bc: string
): Promise<Product | undefined> {
  const barCode = bc.trim().toLocaleLowerCase();
  const cachedFn = unstable_cache(
    async (barCode: string) => {
      try {
        console.warn(`Fetching product with barcode ${barCode} from database`);
        const product = await prisma.product.findFirst({
          where: { barCode: {
            mode: "insensitive",
            equals: barCode
          } },
        });
        if (!product) {
          return undefined;
        }
        return product;
      } catch (error) {
        console.error(`Error fetching product with barcode ${barCode}:`, error);
        return undefined;
      }
    },
    [`product-barcode-${barCode}`],
    {
      revalidate: false, // only via revalidateTag()
      tags: [`product-barcode-${barCode}`],
    }
  );
  return cachedFn(barCode);

}
export async function getProductById(
  productId: string
): Promise<Product | undefined> {
  const cachedFn = unstable_cache(
    async (productId: string) => {
      try {
        console.warn(`Fetching product with ID ${productId} from database`);
        const product = await prisma.product.findUnique({
          where: { id: productId },
        });
        if (product) {
          return product;
        }
        return undefined;
      } catch (error) {
        console.error(`Error fetching product with ID ${productId}:`, error);
        return undefined;
      }
    },
    [`product-id-${productId}`],
    {
      revalidate: false, // only via revalidateTag()
      tags: [`product-id-${productId}`],
    }
  );
  return cachedFn(productId);

}

export async function getPaginatedProducts(page: number, pageSize: number): Promise<Product[]> {
  try {
    console.warn(`Fetching products page ${page} with page size ${pageSize} from database`);
    const products = await prisma.product.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });
    return products;
  } catch (error) {
    console.error(`Error fetching products page ${page}:`, error);
    return [];
  }

}
export async function getTotalProductCount(): Promise<number> {
  const cachedFn = unstable_cache(
    async () => {
      try {
        console.warn(`Fetching total product count from database`);
        const count = await prisma.product.count();
        return count;
      } catch (error) {
        console.error(`Error fetching total product count:`, error);
        return 0;
      }
    },
    [`products-total-count`],
    {
      revalidate: 300, // revalidate every 5 minutes
    }
  );
  return cachedFn();
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

export async function createNewProduct(barCode: string, name: string, price: number, userId: number): Promise<Product> {
  const newProduct = await prisma.product.create({
    data: {
      barCode,
      name,
      price,
      createdByUser: { connect: { id: userId } },
      updatedByUser: { connect: { id: userId } },
    },
  });
  revalidateTag(`product-barcode-${barCode}`);
  revalidateTag(`product-id-${newProduct.id}`);
  revalidateTag(`products-total-count`);
  return newProduct;
}

export async function updateProduct(id: string, barCode: string, name: string, price: number, userId: number): Promise<Product> {
  const res = await prisma.product.update({
    where: { id },
    data: {
      barCode,
      name,
      price,
      updatedByUser: { connect: { id: userId } },
    },
  });
  revalidateTag(`product-barcode-${barCode}`);
  revalidateTag(`product-id-${id}`);
  return res;
}

export async function getPaginatedUserSales(
  userId: number,
  page: number,
  pageSize: number,
  rangeDateDays: number,
): Promise<Sale[]> {
  try {
    console.warn(`Fetching sales for user ${userId}, page ${page} with page size ${pageSize} and date range of ${rangeDateDays} days`);
    
    // Calculate the date 3 days ago
    const gteDate = new Date();
    gteDate.setDate(gteDate.getDate() - rangeDateDays);
    
    const sales = await prisma.sale.findMany({
      where: {
        sellerId: userId,
        saleDate: {
          gte: gteDate,
        },
      },
      include: {
        saleProducts: {
          include: {
            product: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { saleDate: "desc" },
    });
    
    return sales as Sale[];
  } catch (error) {
    console.error(`Error fetching sales for user ${userId}, page ${page}:`, error);
    return [];
  }
}

export async function getTotalUserSalesCount(userId: number, rangeDateDays: number): Promise<number> {
  try {
    console.warn(`Fetching total sales count for user ${userId} with date range of ${rangeDateDays} days`);
    
    // Calculate the date 3 days ago
    const gteDate = new Date();
    gteDate.setDate(gteDate.getDate() - rangeDateDays);
    
    const count = await prisma.sale.count({
      where: {
        sellerId: userId,
        saleDate: {
          gte: gteDate,
        },
      },
    });
    
    return count;
  } catch (error) {
    console.error(`Error fetching total sales count for user ${userId}:`, error);
    return 0;
  }
}

export async function getSalesByProductId(
  userId: number,
  productId: string,
  page: number,
  pageSize: number,
  rangeDateDays: number,
): Promise<Sale[]> {
  try {
    console.warn(`Fetching sales for user ${userId} with product ${productId}, page ${page} with page size ${pageSize} and date range of ${rangeDateDays} days`);
    
    // Calculate the date 3 days ago
    const gteDate = new Date();
    gteDate.setDate(gteDate.getDate() - rangeDateDays);
    
    const sales = await prisma.sale.findMany({
      where: {
        sellerId: userId,
        saleDate: {
          gte: gteDate,
        },
        saleProducts: {
          some: {
            productId: productId,
          },
        },
      },
      include: {
        saleProducts: {
          include: {
            product: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { saleDate: "desc" },
    });
    
    return sales as Sale[];
  } catch (error) {
    console.error(`Error fetching sales by product for user ${userId}:`, error);
    return [];
  }
}

export async function getTotalUserSalesByProductCount(
  userId: number,
  productId: string,
  rangeDateDays: number,
): Promise<number> {
  try {
    console.warn(`Fetching total sales count for user ${userId} with product ${productId} and date range of ${rangeDateDays} days`);
    
    // Calculate the date 3 days ago
    const gteDate = new Date();
    gteDate.setDate(gteDate.getDate() - rangeDateDays);
    
    const count = await prisma.sale.count({
      where: {
        sellerId: userId,
        saleDate: {
          gte: gteDate,
        },
        saleProducts: {
          some: {
            productId: productId,
          },
        },
      },
    });
    
    return count;
  } catch (error) {
    console.error(`Error fetching total sales count by product for user ${userId}:`, error);
    return 0;
  }
}