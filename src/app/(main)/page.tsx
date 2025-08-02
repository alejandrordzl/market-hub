'use client';

import { SearchInputComponent } from "@/components";
import { ProductsTableComponent } from "@/components/ProductsTableComponent";
import { useEffect, useState } from "react";
import { CheckoutActionsComponent } from "@/components/CheckoutActionsComponent";

async function createInitialSale() {
  try {
   
   const url = new URL('/api/v1/sales', process.env.NEXT_PUBLIC_BASE_URL);
   const initialSale = await fetch(url, {
    method: 'POST',
    credentials: 'include',
   })
   return initialSale.json();
  } catch (error) {
    console.error("Error fetching initial sale:", error);
  }
}

export default function Home() {
  const [initialSale, setInitialSale] = useState<{ id: string } | null>(null);
  useEffect(() => {
    createInitialSale().then(setInitialSale);
  }, []);
  if (!initialSale) {
    return <div>Loading...</div>;
  }
  return (
    <main className="flex flex-col items-center justify-between m-2 md:m-4 ml-0">
      <h1 className="text-2xl md:text-4xl p-2 md:p-4 w-full">Venta</h1>
      <div className="flex flex-col md:flex-row w-full p-2 md:p-4 bg-gray-200 rounded-lg">
        <div className="w-full md:w-[80%] flex flex-col p-2 md:p-4">
          <SearchInputComponent initialSaleId={initialSale.id} />
          <ProductsTableComponent initialSaleId={initialSale.id} />
        </div>

        <CheckoutActionsComponent saleId={initialSale.id} />
      </div>
    </main>
  );
}