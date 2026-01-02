'use server';

import { createNewProduct } from "@/clients";

interface AddProductState {
    status: "idle" | "success" | "error";
    error?: string;
}

export async function addProductAction(
    previousState: AddProductState | undefined,
    formData: FormData
): Promise<AddProductState> {
    try {
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

        // Create product
        const result = await createNewProduct(barCode.trim(), name.trim(), priceNumber, userIdNumber);
        if(!result) {
            return {
                status: "error",
                error: "No se pudo crear el producto"
            };
        }

        return {
            status: "success"
        };
    } catch (error) {
        console.error("Error creating product:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Error desconocido"
        };
    }
}