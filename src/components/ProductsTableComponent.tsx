'use client';
import { mutate } from "swr";
import { useSale } from "../hooks/sales";

interface ProductsTableComponentProps {
  initialSaleId: string;
}
export function ProductsTableComponent({ initialSaleId }: ProductsTableComponentProps) {
  const { data, isLoading, error } = useSale(initialSaleId);

  if (isLoading) {
    return <div className="text-center p-4">Cargando productos...</div>;
  }
  if (error) {
    return <div className="text-center p-4 text-red-500">Error al cargar los productos</div>;
  }

  async function deleteItemFromSale(itemId: string) {
    try {
      const response = await fetch(`/api/v1/sales/${initialSaleId}/items/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error("Error deleting item from sale");
      }
      mutate(["sales", initialSaleId]);
    } catch (error) {
      console.error("Error deleting item from sale:", error);
      //TODO: Show toast notification
    }

  }

  return (
    <section className="p-2 overflow-x-auto">

    <table className="min-w-full text-sm md:text-md text-left text-gray-800">
      <thead className="bg-blue-500 text-white">
        <tr>
          <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">
            Codigo
          </th>
          <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">
            Nombre
          </th>
          <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">
            Precio
          </th>
          <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">
            Cantidad
          </th>
          <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">
            Subtotal
          </th>
          <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">
            Eliminar
          </th>
        </tr>
      </thead>
      <tbody className="bg-white">
        {
          data?.saleProducts.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="px-4 md:px-6 py-2">{item.product?.barCode}</td>
              <td className="px-4 md:px-6 py-2">{item.product?.name}</td>
              <td className="px-4 md:px-6 py-2">${item.product?.price?.toFixed(2)}</td>
              <td className="px-4 md:px-6 py-2">{item.quantity}</td>
              <td className="px-4 md:px-6 py-2">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </td>
              <td className="px-4 md:px-6 py-2">
                <button onClick={()=> deleteItemFromSale(item.id)} className="text-red-500 hover:text-red-700 hover:cursor-pointer">Eliminar</button>
              </td>
            </tr>
          ))
        }
      </tbody>
    </table>
    </section>
  );
}
