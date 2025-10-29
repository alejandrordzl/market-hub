"use client";
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

    // Clear input immediately for better UX
    ref.current!.value = "";

    try {
      // Start the API call without awaiting to make it non-blocking
      const addItemPromise = fetch(
        `/api/v1/sales/${initialSaleId}/items/add`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            barCode: barcode.trim(),
          }),
        }
      );

      // Immediately refresh the data (optimistic update)
      

      // Handle the response in the background
      const addItemResponse = await addItemPromise;
      if (addItemResponse.ok) {
          mutate(["sales", initialSaleId]);
      } else {
        // If there was an error, refresh again to get correct state
        mutate(["sales", initialSaleId]);
        
        const errorData = await addItemResponse.json();
        
        // Handle different error cases
        switch (addItemResponse.status) {
          case 404:
            alert("Producto no encontrado o inactivo");
            break;
          case 400:
            alert(errorData.error || "Error en los datos enviados");
            break;
          default:
            alert("Error al agregar el producto a la venta");
        }
      }
    } catch (error) {
      // If network error, refresh data and show error
      mutate(["sales", initialSaleId]);
      console.error("Error adding product to sale:", error);
      alert("Error al conectar con el servidor");
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
