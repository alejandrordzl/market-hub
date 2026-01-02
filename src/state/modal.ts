import { create } from "zustand";
export interface CheckoutModalStore {
    isModalOpen: boolean;
    setModalOpen: (isOpen: boolean) => void;
}
export const useCheckoutModalStore = create<CheckoutModalStore>((set) => ({
    isModalOpen: false,
    setModalOpen: (isOpen: boolean) => set(() => ({ isModalOpen: isOpen })),
}));