'use server';

import { createProductSaleItems, createSale } from "@/clients/db";
import { PaymentMethod, SaleItem } from "@/utils/types";

export async function confirmPayment(
    sellerId: number,
    amountReceived: number,
    change: number,
    paymentMethod: PaymentMethod,
    total: number,
    items: SaleItem[]
) {
    try {
        console.log("Confirming payment for sale:")
        // Create the sale in the database
        const sale = await createSale(total, amountReceived, change, sellerId, paymentMethod);
        // Create sale items in the database
        await createProductSaleItems(sale.id, items);

        return { success: true, message: "Sale created successfully" };
    } catch (error) {
        console.error("Error confirming payment:", error);
        return { success: false, message: "Error confirming payment" };
    }
}