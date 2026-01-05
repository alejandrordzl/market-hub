'use server';

import { createProductSaleItems, createSale } from "@/clients/db";
import { PaymentMethod, SaleItem } from "@/utils/types";

export interface ConfirmPaymentState {
    status: "idle" | "success" | "error";
    error?: string;
}

export async function confirmPaymentAction(
    previousState: ConfirmPaymentState | undefined,
    formData: FormData
): Promise<ConfirmPaymentState> {
    try {
        const sellerId = parseInt(formData.get("sellerId") as string);
        const amountReceived = parseFloat(formData.get("amountReceived") as string);
        const total = parseFloat(formData.get("total") as string);
        const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
        const salesData = formData.get("sales") as string;

        // Validation
        if (isNaN(amountReceived) || amountReceived < total) {
            return {
                status: "error",
                error: "Cantidad insuficiente",
            };
        }

        const items: SaleItem[] = JSON.parse(salesData);
        const change = amountReceived - total;

        console.log("Confirming payment for sale:");
        
        // Create the sale in the database
        const sale = await createSale(total, amountReceived, change, sellerId, paymentMethod);
        
        // Create sale items in the database
        await createProductSaleItems(sale.id, items);

        return {
            status: "success",
        };
    } catch (error) {
        console.error("Error confirming payment:", error);
        return {
            status: "error",
            error: error instanceof Error ? error.message : "Error confirmando el pago",
        };
    }
}