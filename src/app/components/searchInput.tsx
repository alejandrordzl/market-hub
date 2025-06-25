"use client";
import { useRef } from "react";
import { useClient } from "../hooks";
import { useAddSaleItem, useCurrentSale } from "../hooks/sales";

export const SearchInputComponent = () => {
  const client = useClient();
  const addSaleItem = useAddSaleItem();
  const currentSale = useCurrentSale();
  const ref = useRef<HTMLInputElement>(null);

  async function handleSearchProduct() {
    const barcode = ref.current?.value;
    if (currentSale.error || !currentSale.data?.id) {
      alert("No hay una venta activa. Por favor, inicia una venta primero.");
      return;
    }
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
      alert("Se encontraron múltiples productos con el mismo código de barras. Por favor, verifique el código de barras.");
      return;
    } else if (getProductResponse.data.data.length === 0) {
      alert("No se encontraron productos con el código de barras proporcionado.");
    }
    const firstProduct = getProductResponse.data.data[0];
    const addItemResponse = await addSaleItem.trigger({
      saleId: currentSale.data?.id,
      productId: firstProduct.id,
    });
    if (addItemResponse.status === 201) {
      console.log("Product added to sale successfully");
      ref.current!.value = "";
      await currentSale.mutate();
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
