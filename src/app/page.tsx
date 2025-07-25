import { SearchInputComponent } from "./components";
import CheckoutActions from "./components/CheckoutActionsComponent";
import { ProductsTableComponent } from "./components/ProductsTableComponent";
import { serverSideClient } from "./hooks/client";
async function createInitialSale(){
      try {
        const response = await serverSideClient.createSale();
        return response.data;
      } catch (error) {
        console.error("Error fetching initial sale:", error);
      }

}
export default async function Home() {
  const initialSale = await createInitialSale();
  if (!initialSale) {
    return <div>Error creating initial sale</div>;
  }
  // console.log("Initial Sale:", initialSale);
  return (
    <main className="flex flex-col items-center justify-between m-2 md:m-4 ml-0">
      <h1 className="text-2xl md:text-4xl p-2 md:p-4 w-full">Venta</h1>
      <div className="flex flex-col md:flex-row w-full p-2 md:p-4 bg-gray-200 rounded-lg">
        <div className="w-full md:w-[80%] flex flex-col p-2 md:p-4">
          
            <SearchInputComponent initialSaleId={initialSale.id} />
          
            <ProductsTableComponent initialSaleId={initialSale.id} />
        </div>

        <CheckoutActions saleId={initialSale.id} />
      </div>
    </main>
  );
}
