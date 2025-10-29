"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedId = parseInt(userId);
      if (isNaN(parsedId)) {
        setError("El ID de usuario debe ser un número válido");
        setUserId("");
        return;
      }
      setLoading(true);

      if (!userId) return;

      const result = await signIn("credentials", {
        userId,
        redirect: false,
      });

      if (result?.error) {
        console.error("Error al iniciar sesión:", result.error);
        setError("Error al iniciar sesión");
        return;
      }
      window.location.href = "/";
    } catch (error) {
      console.error("Unexpected error:", error);
      setError(
        `Error inesperado: ${
          error instanceof Error
            ? error.message
            : "Ocurrió un error desconocido"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between p-4">
      {loading && (
        <div className="absolute top-0 left-0 w-full h-full bg-gray-100 opacity-80 z-3">
          <div className="flex flex-col items-center justify-center h-full">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-black my-4" />
            <span>Cargando...</span>
          </div>
        </div>
      )}
      <h1 className="text-2xl md:text-4xl">Iniciar sesión</h1>
      <form className="flex flex-col w-full max-w-md" onSubmit={handleLogin}>
        <div className="text-red-500 mb-4">{error && <p>{error}</p>}</div>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          type="text"
          placeholder="Numero de empleado"
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <button className="bg-blue-500 text-white p-2 rounded cursor-pointer">
          Iniciar sesión
        </button>
      </form>
    </main>
  );
}
