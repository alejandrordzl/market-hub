"use server";

import {
  getPaginatedUserSales,
  getTotalUserSalesCount,
  getSalesByProductId,
  getTotalUserSalesByProductCount,
  getProductByBarcode,
} from "@/clients";
import { Sale } from "@/utils/types";

const DEFAULT_DATE_RANGE_DAYS = 2;

export async function getUserSales(
  userId: number,
  page: number,
  pageSize: number
): Promise<{
  status: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  error?: string;
  sales?: Sale[];
}> {
  try {
    const sales = await getPaginatedUserSales(userId, page, pageSize, DEFAULT_DATE_RANGE_DAYS);
    const totalSales = await getTotalUserSalesCount(userId, DEFAULT_DATE_RANGE_DAYS);
    const totalPages = Math.ceil(totalSales / pageSize);

    return {
      status: 200,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems: totalSales,
      },
      sales,
    };
  } catch (error) {
    console.error("Error fetching user sales:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function searchSalesByProductBarcode(
  userId: number,
  barCode: string,
  page: number,
  pageSize: number
): Promise<{
  status: number;
  pagination?: {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
  };
  error?: string;
  sales?: Sale[];
}> {
  try {
    // First, get the product from cache using the existing function
    const product = await getProductByBarcode(barCode.trim());

    if (!product) {
      return {
        status: 404,
        error: "Producto no encontrado",
      };
    }

    // Now search for sales that include this product
    const sales = await getSalesByProductId(userId, product.id, page, pageSize, DEFAULT_DATE_RANGE_DAYS);
    const totalSales = await getTotalUserSalesByProductCount(userId, product.id, DEFAULT_DATE_RANGE_DAYS);
    const totalPages = Math.ceil(totalSales / pageSize);

    return {
      status: 200,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems: totalSales,
      },
      sales,
    };
  } catch (error) {
    console.error("Error searching sales by product barcode:", error);
    return {
      status: 500,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}