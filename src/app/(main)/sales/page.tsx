"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Sale } from "@/utils/types";
import { getUserSales, searchSalesByProductBarcode } from "./serverActions";

export default function SalesPage() {
  const { data: session } = useSession();
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [totalSales, setTotalSales] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const limit = 10;

  const fetchSales = useCallback(
    async (page: number) => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        setError(null);
        setIsSearching(false);
        const userId = parseInt(session.user.id);
        const response = await getUserSales(userId, page, limit);

        if (response.status !== 200) {
          throw new Error(`Error fetching sales: ${response.error}`);
        }

        setSales(response.sales || []);
        setCurrentPage(response.pagination?.page || 1);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalSales(response.pagination?.totalItems || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
        setSales([]);
      } finally {
        setLoading(false);
      }
    },
    [session, limit]
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchSales(1);
    }
  }, [session, fetchSales]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;

    try {
      if (!searchBarcode.trim()) {
        fetchSales(1);
        return;
      }

      setLoading(true);
      setError(null);
      setIsSearching(true);
      setCurrentPage(1);

      const userId = parseInt(session.user.id);
      const response = await searchSalesByProductBarcode(
        userId,
        searchBarcode,
        1,
        limit
      );

      if (response.status === 200) {
        setSales(response.sales || []);
        setTotalPages(response.pagination?.totalPages || 1);
        setTotalSales(response.pagination?.totalItems || 0);
        setError(null);
      } else if (response.status === 404) {
        setSales([]);
        setTotalPages(0);
        setTotalSales(0);
        setError("No se encontraron ventas con ese producto");
      } else {
        throw new Error(response.error || "Error desconocido");
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "Error desconocido");
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearSearch = () => {
    setSearchBarcode("");
    setCurrentPage(1);
    setIsSearching(false);
    fetchSales(1);
  };

  const handlePageChange = async (page: number) => {
    if (!session?.user?.id) return;

    setCurrentPage(page);
    const userId = parseInt(session.user.id);

    try {
      setLoading(true);
      setError(null);

      if (isSearching && searchBarcode.trim()) {
        const response = await searchSalesByProductBarcode(
          userId,
          searchBarcode,
          page,
          limit
        );

        if (response.status === 200) {
          setSales(response.sales || []);
          setCurrentPage(response.pagination?.page || page);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalSales(response.pagination?.totalItems || 0);
        } else {
          throw new Error(response.error || "Error desconocido");
        }
      } else {
        fetchSales(page);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - new Date(date).getTime();
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) {
      return "Hace unos segundos";
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours} ${diffInHours === 1 ? "hora" : "horas"}`;
    } else if (diffInDays === 1) {
      return "Hace 1 día";
    } else if (diffInDays < 3) {
      return `Hace ${diffInDays} días`;
    } else {
      return "";
    }
  };

  const formatDate = (date: Date) => {
    const formattedDate = new Date(date).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const relativeTime = getRelativeTime(date);
    return relativeTime ? `${formattedDate} (${relativeTime})` : formattedDate;
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(2)}`;
  };

  const handleCopyId = async (saleId: string) => {
    try {
      await navigator.clipboard.writeText(saleId);
      setCopiedId(saleId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!session) {
    return (
      <main className="flex flex-col m-2 md:m-4 ml-0">
        <div className="text-center p-8">
          <p className="text-gray-600">Cargando sesión...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col m-2 md:m-4 ml-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <h1 className="text-2xl md:text-4xl p-2 md:p-4">Ventas</h1>
      </div>

      <div className="bg-gray-200 rounded-lg p-2 md:p-4">
        {/* Search Section */}
        <div className="mb-4 bg-white p-4 rounded-lg">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2"
          >
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar ventas por código de barras del producto..."
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
                className="w-full h-10 md:h-12 p-2 pl-4 text-black bg-gray-50 border border-gray-300 text-base md:text-lg rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoComplete="off"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed min-w-[80px]"
              >
                {loading ? "Buscando..." : "Buscar"}
              </button>
              <button
                type="button"
                onClick={handleClearSearch}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Limpiar
              </button>
            </div>
          </form>
        </div>

        {/* Status Information */}
        <div className="mb-4 text-sm text-gray-600 bg-white p-3 rounded-lg">
          {isSearching ? (
            <p>
              Buscando ventas que incluyen el producto con código:{" "}
              <strong>{searchBarcode}</strong>
            </p>
          ) : (
            <p>
              Mostrando tus ventas de los últimos 2 días
            </p>
          )}
          {!loading && (
            <p>
              Total de ventas: <strong>{totalSales}</strong>
            </p>
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-600">Cargando ventas...</p>
          </div>
        )}

        {/* Sales List */}
        {!loading && sales.length > 0 && (
          <div className="space-y-4">
            {sales.map((sale) => (
              <div
                key={sale.id}
                className="bg-white rounded-lg p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Sale Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                  <div className="mb-2 md:mb-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Venta #{sale.id.slice(0, 8)}
                      </h3>
                      <button
                        onClick={() => handleCopyId(sale.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Copiar ID completo"
                      >
                        {copiedId === sale.id ? (
                          <svg
                            className="w-4 h-4 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            className="w-4 h-4 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600">
                      {formatDate(sale.saleDate)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        sale.status === "CONCLUDED"
                          ? "bg-green-100 text-green-800"
                          : sale.status === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {sale.status === "CONCLUDED"
                        ? "Concluida"
                        : sale.status === "PENDING"
                        ? "Pendiente"
                        : "Cancelada"}
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      {sale.paymentMethod === "CASH"
                        ? "Efectivo"
                        : "Tarjeta de Crédito"}
                    </span>
                  </div>
                </div>

                {/* Products Table */}
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Productos:
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                            Código
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                            Producto
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                            Precio
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                            Cantidad
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sale.saleProducts?.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-4 py-2 font-mono text-xs">
                              {item.product?.barCode || "N/A"}
                            </td>
                            <td className="px-4 py-2">
                              {item.product?.name || "Producto sin nombre"}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {formatPrice(item.product?.price || 0)}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold">
                              {formatPrice(
                                (item.product?.price || 0) * item.quantity
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Sale Summary */}
                <div className="flex flex-col md:flex-row md:justify-end gap-2 pt-4 border-t">
                  <div className="space-y-1 md:text-right">
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-600">Total:</span>
                      <span className="font-bold text-lg text-green-600">
                        {formatPrice(sale.total)}
                      </span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-600">Recibido:</span>
                      <span className="font-semibold">
                        {formatPrice(sale.amountReceived)}
                      </span>
                    </div>
                    <div className="flex justify-between md:justify-end gap-8 text-sm">
                      <span className="text-gray-600">Cambio:</span>
                      <span className="font-semibold">
                        {formatPrice(sale.change)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && sales.length === 0 && !error && (
          <div className="text-center p-8 bg-white rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isSearching
                ? "No se encontraron ventas"
                : "No hay ventas disponibles"}
            </h3>
            <p className="text-gray-600">
              {isSearching
                ? `No hay ventas que incluyan el producto con código "${searchBarcode}"`
                : "No tienes ventas registradas en los últimos 3 días"}
            </p>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ver todas las ventas
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && sales.length > 0 && totalPages > 1 && (
          <div className="mt-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg">
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Primera
              </button>

              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>

              {/* Page Numbers */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let page: number;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      disabled={loading}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>

              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || loading}
                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Última
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
