"use client";
import { useSale } from "@/hooks/sales";
import { Product, SaleItem } from "@/utils/types";
import { useEffect, useRef } from "react";
import { mutate } from "swr";

interface SearchInputComponentProps {
  initialSaleId: string;
  setModalOpen?: (isOpen: boolean) => void;
  isModalOpen: boolean;
}
export const SearchInputComponent = ({
  initialSaleId,
  setModalOpen,
  isModalOpen,
}: SearchInputComponentProps) => {
  const ref = useRef<HTMLInputElement>(null);
  const { data: sale } = useSale(initialSaleId);
  useEffect(() => {
    // Auto focus input field on component mount
    ref.current?.focus();

    // Keep focusing every 10 second in case of losing focus
    const autoFocusInterval = setInterval(() => {
      if(isModalOpen) return;
      ref.current?.focus();
    }, 10000);
    return () => clearInterval(autoFocusInterval);
  }, [isModalOpen]);

  async function updateItemQuantity(itemInSale: SaleItem) {
    try {
      const increaseQuantity = await fetch(
        `/api/v1/sales/${initialSaleId}/items/${itemInSale.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: itemInSale.quantity + 1,
          }),
        }
      );
      if (increaseQuantity.ok) {
        mutate(["sales", initialSaleId]);
      }
      ref.current!.value = "";
    } catch (error) {
      console.error("Error updating item quantity:", error);
    }
  }

  async function handleSearchProduct() {
    const barcode = ref.current?.value;
    if(barcode === ""){
      setModalOpen?.(true);
      return;
    }
    if (!barcode) {
      alert("Por favor, ingrese un código de barras");
      return;
    }
    const itemInSale = sale?.saleProducts.find(
      (sp) => sp?.product?.barCode === barcode
    );
    if (itemInSale) {
      await updateItemQuantity(itemInSale);
    } else {
      const result = await fetch(`/api/v1/products/code/${barcode}`, {
        method: "GET",
        credentials: "include",
      });
      const searchProductResponse: { data: Product[] } = await result.json();

      if (result.status === 404) {
        alert("Producto no encontrado");
      } else if (result.status !== 200) {
        alert("Error al buscar el producto, por favor intente de nuevo");
      }
      if (searchProductResponse.data.length > 1) {
        alert(
          "Se encontraron múltiples productos con el mismo código de barras. Por favor, verifique el código de barras."
        );
        return;
      } else if (searchProductResponse.data.length === 0) {
        alert(
          "No se encontraron productos con el código de barras proporcionado."
        );
      }
      const firstProduct = searchProductResponse.data[0];

      const addItemResponse = await fetch(
        `/api/v1/sales/${initialSaleId}/items`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId: firstProduct.id,
            quantity: 1,
          }),
        }
      );
      if (addItemResponse.ok) {
        mutate(["sales", initialSaleId]);
        ref.current!.value = "";
      } else {
        alert("Error al agregar el producto a la venta");
      }
    }
  }

  async function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      await handleSearchProduct();
    }
  }
  return (
    <section className="p-2">
      <input
        onKeyDown={handleKeyDown}
        ref={ref}
        type="text"
        placeholder="Código de barras"
        className="w-full h-10 md:h-12 p-2 pl-4 md:pl-6 text-black bg-white text-base md:text-lg rounded-lg"
        autoComplete="off"
      />
    </section>
  );
};
