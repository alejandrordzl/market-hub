'use server';
import { getProductById, updateProduct } from "@/clients";
import { revalidateTag } from "next/cache";



interface UpdateProductState {
    status: "idle" | "success" | "error";
    error?: string;
}

export async function updateProductAction(
    previousState: UpdateProductState | undefined,
    formData: FormData
): Promise<UpdateProductState> {
    try {
        const productId = formData.get("productId") as string;
        const name = formData.get("name") as string;
        const barCode = formData.get("barCode") as string;
        const price = formData.get("price") as string;
        const userId = formData.get("userId") as string;

        // Validation
        if (!name?.trim()) {
            return {
                status: "error",
                error: "El nombre es obligatorio"
            };
        }

        if (!barCode?.trim()) {
            return {
                status: "error",
                error: "El código de barras es obligatorio"
            };
        }

        if (!price?.trim()) {
            return {
                status: "error",
                error: "El precio es obligatorio"
            };
        }

        const priceNumber = parseFloat(price);
        const userIdNumber = parseFloat(userId);
        if (isNaN(priceNumber) || priceNumber < 0) {
            return {
                status: "error",
                error: "El precio debe ser un número válido mayor o igual a 0"
            };
        }

        // Update product
        const result = await updateProduct(productId, barCode.trim(), name.trim(), priceNumber, userIdNumber);
        if(!result) {
            return {
                status: "error",
                error: "No se pudo actualizar el producto"
            };
        }
        revalidateTag(`product-id-${productId}`);
        revalidateTag(`product-barcode-${barCode.trim()}`);
        return {
            status: "success"
        };
    } catch (error) {
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
}

export async function getProduct(id: string) {
    try {
        const product = await getProductById(id);
        return product;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        return null;
    }
}