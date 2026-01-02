"use client";
import { useSalesStore } from "@/state";
import Image from "next/image";

export function ProductsTableComponent() {
  const {
    sales,
    increaseItemQuantity,
    reduceItemFromSale,
    removeItemFromSale,
  } = useSalesStore();
  console.log
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
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {sales?.map((item) => (
            <tr key={item.id} className="border-b hover:bg-gray-100">
              <td className="px-4 md:px-6 py-2">{item.product?.barCode}</td>
              <td className="px-4 md:px-6 py-2">{item.product?.name}</td>
              <td className="px-4 md:px-6 py-2">${item.product?.price?.toFixed(2)}</td>
              <td className="px-4 md:px-6 py-2">{item.quantity}</td>
              <td className="px-4 md:px-6 py-2">
                ${((item.product?.price || 0) * item.quantity).toFixed(2)}
              </td>
              <td className="px-4 md:px-6 py-2 gap-3 flex items-center">
                <button
                  onClick={() => increaseItemQuantity(item.id)}
                  className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                >
                  <Image
                    src="/add_icon.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
                <button
                  onClick={() => reduceItemFromSale(item.id)}
                  className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                >
                  <Image
                    src="/subtract_icon.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
                <button
                  onClick={() => removeItemFromSale(item.id)}
                  className="text-red-500 hover:text-red-700 hover:cursor-pointer"
                >
                  <Image
                    src="/delete_icon.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
