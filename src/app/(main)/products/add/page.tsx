"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addProductAction } from "./serverActions";

export default function AddProductPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [addState, formAction] = useActionState(addProductAction, {
    status: "idle",
  });

  // Handle action state changes
  useEffect(() => {
    if (addState.status === "success") {
      router.push("/products?created=true");
    }
  }, [addState, router]);

  const handleCancel = () => {
    router.back();
  };

  return (
    <main className="flex flex-col m-2 md:m-4 ml-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <h1 className="text-2xl md:text-4xl p-2 md:p-4">Agregar Producto</h1>
      </div>

      <div className="bg-gray-200 rounded-lg p-2 md:p-4">
        {/* Error Message */}
        {addState.status === "error" && addState.error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {addState.error}
          </div>
        )}

        {/* Add Form */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Nuevo Producto
          </h2>

          <form action={formAction} className="space-y-4">
            {/* Hidden user ID */}
            <input
              type="hidden"
              name="userId"
              value={session?.user?.id || ""}
            />

            {/* Product Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre del Producto *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el nombre del producto"
                required
                autoFocus
              />
            </div>

            {/* Barcode */}
            <div>
              <label
                htmlFor="barCode"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Código de Barras *
              </label>
              <input
                type="text"
                id="barCode"
                name="barCode"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Ingrese el código de barras"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Precio *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Crear Producto
              </button>

              <button
                type="reset"
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Limpiar Formulario
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            💡 Consejos para agregar productos:
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              • El nombre debe ser descriptivo y único para facilitar la
              búsqueda
            </li>
            <li>• El código de barras debe ser único en el sistema</li>
            <li>
              • Asegúrese de ingresar el precio correcto, puede incluir centavos
            </li>
            <li>• Todos los campos marcados con (*) son obligatorios</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
