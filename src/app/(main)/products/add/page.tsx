"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    barCode: "",
    price: "",
  });

  const [validationErrors, setValidationErrors] = useState<{
    name?: string;
    barCode?: string;
    price?: string;
  }>({});

  const validateForm = () => {
    const errors: typeof validationErrors = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre es obligatorio";
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.barCode.trim()) {
      errors.barCode = "El código de barras es obligatorio";
    } else if (formData.barCode.trim().length < 3) {
      errors.barCode = "El código de barras debe tener al menos 3 caracteres";
    }

    if (!formData.price.trim()) {
      errors.price = "El precio es obligatorio";
    } else {
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        errors.price = "El precio debe ser un número válido mayor o igual a 0";
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch("/api/v1/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          barCode: formData.barCode.trim(),
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear el producto");
      }

      // Redirect back to products list with success message
      router.push("/products?created=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCancel = () => {
    router.push("/products");
  };

  const handleReset = () => {
    setFormData({ name: "", barCode: "", price: "" });
    setValidationErrors({});
    setError(null);
  };

  return (
    <main className="flex flex-col m-2 md:m-4 ml-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-4">
        <h1 className="text-2xl md:text-4xl p-2 md:p-4">Agregar Producto</h1>
      </div>

      <div className="bg-gray-200 rounded-lg p-2 md:p-4">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Add Form */}
        <div className="bg-white rounded-lg p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Información del Nuevo Producto
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  validationErrors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ingrese el nombre del producto"
                disabled={saving}
                autoFocus
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.name}
                </p>
              )}
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
                value={formData.barCode}
                onChange={(e) => handleInputChange("barCode", e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono ${
                  validationErrors.barCode
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Ingrese el código de barras"
                disabled={saving}
              />
              {validationErrors.barCode && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.barCode}
                </p>
              )}
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
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                  className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    validationErrors.price
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="0.00"
                  disabled={saving}
                />
              </div>
              {validationErrors.price && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.price}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex flex-col md:flex-row gap-3 pt-4 border-t">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
                disabled={saving}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
