export default function LoginPage() {
  return (
    <main className="flex flex-col items-center justify-between p-4">
      <h1 className="text-2xl md:text-4xl">Iniciar sesión</h1>
      <form className="flex flex-col w-full max-w-md">
        <input
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
