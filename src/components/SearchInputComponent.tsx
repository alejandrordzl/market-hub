"use client";
import { useActionState, useEffect } from "react";
import { searchProduct } from "@/clients";
import { useCheckoutModalStore, useSalesStore } from "@/state";

export const SearchInputComponent = () => {
  const addItemToSale = useSalesStore((state) => state.addItemToSale);
  const { isModalOpen, setModalOpen } = useCheckoutModalStore();
  // Keep focusing every 10 second in case of losing focus
  useEffect(() => {
    if (isModalOpen) return;
    const autoFocusInterval = setInterval(() => {
      const inputElement = document.getElementById(
        "barCode"
      ) as HTMLInputElement | null;
      inputElement?.focus();
    }, 10000);
    return () => clearInterval(autoFocusInterval);
  }, [isModalOpen]);

  const [state, formAction] = useActionState(searchProduct, {
    product: undefined,
    status: "do_nothing",
  });
  useEffect(() => {
    if (state.status === "do_nothing") return;
    if (state.status === "not_found") {
      alert("Producto no encontrado");
    }
    if (state.status === "found" && state.product) {
      addItemToSale(state.product);
    }
    if (state.status === "use_callback") {
      setModalOpen(true);
    }
  }, [state, addItemToSale, setModalOpen]);
  return (
    <section className="p-2">
      <form action={formAction}>
        <input
          type="text"
          placeholder="Código de barras"
          className="w-full h-10 md:h-12 p-2 pl-4 md:pl-6 text-black bg-white text-base md:text-lg rounded-lg"
          autoComplete="off"
          id="barCode"
          name="barCode"
          autoFocus
        />
      </form>
    </section>
  );
};
