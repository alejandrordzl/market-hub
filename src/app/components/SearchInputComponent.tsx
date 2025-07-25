"use client";
import { useEffect, useRef, useState } from "react";
import { useClient } from "../hooks";
import { Sale } from "@/utils/types";
import { mutate } from "swr";

interface SearchInputComponentProps {
  initialSaleId: string;
}
export const SearchInputComponent = ({ initialSaleId }: SearchInputComponentProps) => {

  const client = useClient();
  const ref = useRef<HTMLInputElement>(null);

  

  async function handleSearchProduct() {
    const barcode = ref.current?.value;
    if (!barcode) {
      alert("Por favor, ingrese un código de barras");
      return;
    }

    const getProductResponse = await client.getProductByBarCode(barcode);
    if (getProductResponse.status === 404) {
      alert("Producto no encontrado");
    } else if (getProductResponse.status !== 200) {
      alert("Error al buscar el producto, por favor intente de nuevo");
    }
    if (getProductResponse.data.data.length > 1) {
      alert(
        "Se encontraron múltiples productos con el mismo código de barras. Por favor, verifique el código de barras."
      );
      return;
    } else if (getProductResponse.data.data.length === 0) {
      alert(
        "No se encontraron productos con el código de barras proporcionado."
      );
    }
    const firstProduct = getProductResponse.data.data[0];
    const addItemResponse = await client.addSaleItem(initialSaleId, {
      productId: firstProduct.id,
      quantity: 1,
    });
    if (addItemResponse.status === 201) {
      console.log("Product added to sale successfully");
      mutate(["sales", initialSaleId]);
      ref.current!.value = "";
    } else {
      console.log("Error found in addItemResponse:", addItemResponse);
      alert("Error al agregar el producto a la venta");
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
