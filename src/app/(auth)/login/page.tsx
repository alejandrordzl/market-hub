'use client';
import { signIn } from "next-auth/react";
// import { redirect } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const [userId, setUserId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const handleLogin = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
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
      console.log("Inicio de sesión exitoso:", result);
      window.location.href = "/";
    } catch (error) {
      console.error("Unexpected error:", error);
      setError(`Error inesperado: ${error instanceof Error ? error.message : "Ocurrió un error desconocido"}`);
    }
  };

  return (
    <main className="flex flex-col items-center justify-between p-4">
      <h1 className="text-2xl md:text-4xl">Iniciar sesión</h1>
      <form className="flex flex-col w-full max-w-md" onSubmit={handleLogin}>
        <div className="text-red-500 mb-4">{error && <p>{error}</p>}</div>
        <label htmlFor="userId">Número de empleado</label>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          type="text"
          placeholder="Numero de empleado"
          className="mb-4 p-2 border border-gray-300 rounded"
        />
        <button className="bg-blue-500 text-white p-2 rounded">
          Iniciar sesión
        </button>
      </form>
    </main>
  );
}
