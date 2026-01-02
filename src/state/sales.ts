import { PaymentMethod, Product, SaleItem } from "@/utils/types";
import { create } from "zustand";


export interface SalesStore {
    sales: SaleItem[];
    total: number;
    paymentMethod: PaymentMethod;
    change: number;
    amountReceived: number;

    addItemToSale: (product: Product) => void;
    removeItemFromSale: (itemId: string) => void;
    reduceItemFromSale: (itemId: string) => void;
    increaseItemQuantity: (itemId: string) => void;
    clearSale: () => void;
    setAmountReceived: (amount: number) => void;
    setChange: (change: number) => void;
    setPaymentMethod: (method: PaymentMethod) => void;
}
const calculateTotal = (sales: SaleItem[]): number => {
    return sales.reduce(
        (acc, item) => acc + (item.product?.price || 0) * item.quantity,
        0
    );
};
export const useSalesStore = create<SalesStore>((set) => ({
    sales: [],
    total: 0,
    paymentMethod: PaymentMethod.CASH,
    amountReceived: 0,
    change: 0,
    addItemToSale: (product) => set((state) => {
        // Check if item already exists in the sale
        const existingItemIndex = state.sales.findIndex(saleItem => saleItem.productId === product.id);
        if (existingItemIndex !== -1) {
            // If it exists, update the quantity
            const updatedSales = [...state.sales];
            updatedSales[existingItemIndex].quantity += 1;
            return { sales: updatedSales, total: calculateTotal(updatedSales) };
        } else {
            // If it doesn't exist, add the new item
            // IDs are calculated by the database, so we can use a temporary placeholder
            const newSaleItem: SaleItem = {
                id: 'temp-' + Math.random().toString(36).substr(2, 9),
                saleId: '',
                productId: product.id,
                quantity: 1,
                product: product,
            };
            const updateSales = [...state.sales, newSaleItem];
            return { sales: updateSales, total: calculateTotal(updateSales) };
        }
    }),

    increaseItemQuantity: (itemId) => set((state) => {
        const existingItemIndex = state.sales.findIndex(saleItem => saleItem.id === itemId);
        if (existingItemIndex !== -1) {
            const updatedSales = [...state.sales];
            updatedSales[existingItemIndex].quantity += 1;
            return { sales: updatedSales, total: calculateTotal(updatedSales) };
        }
        return { sales: state.sales, total: calculateTotal(state.sales) };
    }),
    reduceItemFromSale: (itemId) => set((state) => {
        const existingItemIndex = state.sales.findIndex(saleItem => saleItem.id === itemId);
        if (existingItemIndex !== -1) {
            const updatedSales = [...state.sales];
            if (updatedSales[existingItemIndex].quantity > 1) {
                // Decrease quantity by 1
                updatedSales[existingItemIndex].quantity -= 1;
                return { sales: updatedSales, total: calculateTotal(updatedSales) };
            } else {
                // Remove item if quantity is 1
                updatedSales.splice(existingItemIndex, 1);
                return { sales: updatedSales, total: calculateTotal(updatedSales) };
            }
        }
        return { sales: state.sales, total: calculateTotal(state.sales) };
    }),
    removeItemFromSale: (itemId) => set((state) => {
        const updatedSales = state.sales.filter(item => item.id !== itemId);
        return { sales: updatedSales, total: calculateTotal(updatedSales) };
    }),
    clearSale: () => set(() => ({ sales: [], total: 0, amountReceived: 0, change: 0 })),
    setAmountReceived: (amount: number) => set(() => ({ amountReceived: amount })),
    setChange: (change: number) => set(() => ({ change })),
    setPaymentMethod: (method: PaymentMethod) => set(() => ({ paymentMethod: method })),


}))