import { Product, SaleItem } from "@/utils/types";
import { create } from "zustand";


export interface SalesStore {
    id: string;
    sales: SaleItem[];
    addItemToSale: (product: Product) => void;
    removeItemFromSale: (itemId: string) => void;
    reduceItemFromSale: (itemId: string) => void;
    increaseItemQuantity: (itemId: string) => void;
    clearSale: () => void;
}
export const useSalesStore = create<SalesStore>((set) => ({
    id: crypto.randomUUID(),
    sales: [],
    addItemToSale: (product) => set((state) => {
        // Check if item already exists in the sale
        const existingItemIndex = state.sales.findIndex(saleItem => saleItem.productId === product.id);
        if (existingItemIndex !== -1) {
            // If it exists, update the quantity
            const updatedSales = [...state.sales];
            updatedSales[existingItemIndex].quantity += 1;
            return { sales: updatedSales };
        } else {
            // If it doesn't exist, add the new item
            const newSaleItem: SaleItem = {
                id: crypto.randomUUID(),
                saleId: state.id,
                productId: product.id,
                quantity: 1,
                unitPrice: product.price || 0,
                product: product,
            };
            return { sales: [...state.sales, newSaleItem] };
        }
    }),

    increaseItemQuantity: (itemId) => set((state) => {
        const existingItemIndex = state.sales.findIndex(saleItem => saleItem.id === itemId);
        if (existingItemIndex !== -1) {
            const updatedSales = [...state.sales];
            updatedSales[existingItemIndex].quantity += 1;
            return { sales: updatedSales };
        }
        return { sales: state.sales };
    }),
    reduceItemFromSale: (itemId) => set((state) => {
        const existingItemIndex = state.sales.findIndex(saleItem => saleItem.id === itemId);
        if (existingItemIndex !== -1) {
            const updatedSales = [...state.sales];
            if (updatedSales[existingItemIndex].quantity > 1) {
                // Decrease quantity by 1
                updatedSales[existingItemIndex].quantity -= 1;
                return { sales: updatedSales };
            } else {
                // Remove item if quantity is 1
                updatedSales.splice(existingItemIndex, 1);
                return { sales: updatedSales };
            }
        }
        return { sales: state.sales };
    }),
    removeItemFromSale: (itemId) => set((state) => {
        return { sales: state.sales.filter(item => item.id !== itemId) };
    }),
    clearSale: () => set(() => ({ sales: [] })),


}))