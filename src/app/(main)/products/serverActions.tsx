"use server";

import { getPaginatedProducts, getTotalProductCount } from "@/clients";
import { Product } from "@/utils/types";

export async function getProducts(
  page: number,
  pageSize: number
): Promise<{
    status: number;
    pagination?:{
        page: number;
        pageSize: number;
        totalPages: number;
        totalItems: number;
    }
    error?: string;
    products?: Product[];
}> {
  try {
    const products = await getPaginatedProducts(page, pageSize);
    const totalProducts = await getTotalProductCount();
    const totalPages = Math.ceil(totalProducts / pageSize);
    
    return {
        status:200,
        pagination: {
            page,
            pageSize,
            totalPages,
            totalItems: totalProducts
        },
        products
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    return {
        status: 500,
        error: error instanceof Error ? error.message : "Error desconocido"
    };
  }
}
