"use client";

import { useState, useEffect, useActionState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Product } from "@/utils/types";
import { getProduct, updateProductAction } from "./serverActions";
import { useSession } from "next-auth/react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const { data: session } = useSession();

  const [updateState, formAction] = useActionState(updateProductAction, {
    status: "idle",
  });

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;

      try {
        setLoading(true);
        setFetchError(null);

        const result = await getProduct(productId);
        if (!result) {
          setFetchError("Producto no encontrado");
          setProduct(null);
          return;
        }
        setProduct(result);
      } catch (err) {
        setFetchError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  // Handle update state changes
  useEffect(() => {
    if (updateState.status === "success") {
      router.push("/products?updated=true");
    }
  }, [updateState, router]);

  const handleCancel = () => {
    router.back();
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <main className="flex flex-col m-2 md:m-4 ml-0">
        <div className="text-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2 text-gray-600">Cargando producto...</p>
        </div>
      </main>
    );
  }

  if (fetchError && !product) {
    return (
      <main className="flex flex-col m-2 md:m-4 ml-0">
        <div className="text-center p-8">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{fetchError}</p>
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Volver a productos
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col m-2 md:m-4 ml-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-4xl p-2 md:p-4">Editar Producto</h1>
      </div>

      <div className="bg-gray-200 rounded-lg p-2 md:p-4">
        {/* Product Info Section */}
        {product && (
          <div className="mb-6 bg-white p-4 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Información del Producto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">ID:</span>
                <span className="ml-2 font-mono text-gray-800">
                  {product.id}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Creado:</span>
                <span className="ml-2 text-gray-800">
                  {formatDate(product.createdAt)}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-600">Actualizado:</span>
                <span className="ml-2 text-gray-800">
                  {formatDate(product.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {updateState.status === "error" && updateState.error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {updateState.error}
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Editar Información
          </h2>

          <form action={formAction} className="space-y-4">
            {/* Hidden product ID */}
            <input type="hidden" name="productId" value={productId} />
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
                defaultValue={product?.name || ""}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ingrese el nombre del producto"
                required
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
                defaultValue={product?.barCode || ""}
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
                  defaultValue={product?.price || ""}
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
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                Guardar Cambios
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
      </div>
    </main>
  );
}
