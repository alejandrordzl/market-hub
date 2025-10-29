'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/utils/types';

interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchBarcode, setSearchBarcode] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const limit = 10;

  const fetchProducts = useCallback(async (page: number, barcode?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      let url: string;
      if (barcode && barcode.trim()) {
        url = `/api/v1/products/code/${encodeURIComponent(barcode.trim())}?page=${page}&limit=${limit}`;
        setIsSearching(true);
      } else {
        url = `/api/v1/products?page=${page}&limit=${limit}`;
        setIsSearching(false);
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.status === 404 && barcode) {
        // Product not found by barcode
        setProducts([]);
        setTotalPages(0);
        setTotalProducts(0);
        setError('No se encontraron productos con ese código de barras');
        return;
      }

      if (!response.ok) {
        throw new Error('Error al cargar los productos');
      }

      const data: ProductsResponse = await response.json();
      setProducts(data.data);
      setCurrentPage(data.meta.page);
      setTotalPages(data.meta.totalPages);
      setTotalProducts(data.meta.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchProducts(1);
    
    // Check for success message
    if (searchParams.get('updated') === 'true') {
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      router.replace('/products', { scroll: false });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
    
    if (searchParams.get('created') === 'true') {
      setShowSuccessMessage(true);
      // Remove the parameter from URL
      router.replace('/products', { scroll: false });
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, [fetchProducts, searchParams, router]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts(1, searchBarcode);
  };

  const handleClearSearch = () => {
    setSearchBarcode('');
    setCurrentPage(1);
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page, isSearching ? searchBarcode : undefined);
  };

  const handleEditProduct = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number | null) => {
    if (price === null) return 'N/A';
    return `$${price.toFixed(2)}`;
  };

  return (
    <main className="flex flex-col m-2 md:m-4 ml-0">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
        <h1 className="text-2xl md:text-4xl p-2 md:p-4">Productos</h1>
      </div>
      
      <div className="bg-gray-200 rounded-lg p-2 md:p-4">
        {/* Search Section */}
        <div className="mb-4 bg-white p-4 rounded-lg">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Buscar por código de barras..."
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
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
              {isSearching && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Limpiar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Success Message */}
        {showSuccessMessage && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center justify-between">
            <span>
              ✅ {searchParams.get('created') === 'true' ? 'Producto creado correctamente' : 'Producto actualizado correctamente'}
            </span>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800"
            >
              ✕
            </button>
          </div>
        )}

        {/* Status Information */}
        <div className="mb-4 text-sm text-gray-600">
          {isSearching ? (
            <p>Buscando productos con código de barras: <strong>{searchBarcode}</strong></p>
          ) : (
            <p>Mostrando todos los productos activos</p>
          )}
          {!loading && (
            <p>Total de productos: <strong>{totalProducts}</strong></p>
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
            <p className="mt-2 text-gray-600">Cargando productos...</p>
          </div>
        )}

        {/* Products Table */}
        {!loading && products.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm md:text-base">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Código de Barras</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Nombre</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Precio</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Fecha de Creación</th>
                    <th className="px-4 md:px-6 py-3 text-left font-bold">Última Actualización</th>
                    <th className="px-4 md:px-6 py-3 text-center font-bold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr 
                      key={product.id} 
                      className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}
                    >
                      <td className="px-4 md:px-6 py-3 font-mono text-sm">
                        {product.barCode}
                      </td>
                      <td className="px-4 md:px-6 py-3 font-medium">
                        {product.name}
                      </td>
                      <td className="px-4 md:px-6 py-3 font-semibold text-green-600">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-600 text-sm">
                        {formatDate(product.createdAt)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-gray-600 text-sm">
                        {formatDate(product.updatedAt)}
                      </td>
                      <td className="px-4 md:px-6 py-3 text-center">
                        <button
                          onClick={() => handleEditProduct(product.id)}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition-colors"
                          title="Editar producto"
                        >
                          <svg 
                            className="w-4 h-4 mr-1" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" 
                            />
                          </svg>
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && products.length === 0 && !error && (
          <div className="text-center p-8 bg-white rounded-lg">
            <div className="text-gray-400 text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isSearching ? 'No se encontraron productos' : 'No hay productos disponibles'}
            </h3>
            <p className="text-gray-600">
              {isSearching 
                ? `No hay productos que coincidan con el código de barras "${searchBarcode}"`
                : 'No hay productos registrados en el sistema'
              }
            </p>
            {isSearching && (
              <button
                onClick={handleClearSearch}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Ver todos los productos
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && products.length > 0 && totalPages > 1 && (
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
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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