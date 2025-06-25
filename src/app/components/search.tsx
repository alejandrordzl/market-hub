"use client";
import { useRef } from "react";
import { useClient } from "../hooks";

export const SearchInputComponent = () => {
  const client = useClient();
  const ref = useRef<HTMLInputElement>(null);
  const handleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key !== "Enter") return;

    event.preventDefault();
    const barcode = ref.current?.value;
    if (barcode) {
      const response = await client.getProductByBarCode(barcode);
      if (response.status === 200) {
        console.log("Producto agregado a la venta:", response.data);
      }

      if (response.status === 404) {
        alert("Producto no encontrado");
      }
    }
  };
  return (
    <input
      onKeyDown={handleKeyDown}
      ref={ref}
      type="text"
      placeholder="Código de barras"
      className="w-full h-10 md:h-12 p-2 pl-4 md:pl-6 text-black bg-white text-base md:text-lg rounded-lg"
      autoComplete="off"
    />
  );
};
