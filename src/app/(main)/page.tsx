import { SearchInputComponent } from "@/components";
import { ProductsTableComponent } from "@/components/ProductsTableComponent";
import { CheckoutActionsComponent } from "@/components/CheckoutActions/CheckoutActionsComponent";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between m-2 md:m-4 ml-0">
      <h1 className="text-2xl md:text-4xl p-2 md:p-4 w-full">Venta</h1>
      <div className="flex flex-col md:flex-row w-full p-2 md:p-4 bg-gray-200 rounded-lg">
        <div className="w-full md:w-[80%] flex flex-col p-2 md:p-4">
          <SearchInputComponent />
          <ProductsTableComponent />
        </div>
        <CheckoutActionsComponent />
      </div>
    </main>
  );
}
