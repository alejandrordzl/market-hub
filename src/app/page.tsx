
export default function Home() {
  return (
    <main className="flex flex-col items-center justify-between m-2 md:m-4 ml-0">
      <h1 className="text-2xl md:text-4xl p-2 md:p-4 w-full">Venta</h1>
      <div className="flex flex-col md:flex-row w-full p-2 md:p-4 bg-gray-200 rounded-lg">
        <div className="w-full md:w-[80%] flex flex-col p-2 md:p-4">
          <section className="p-2">
            <input
              type="text"
              placeholder="Código de barras"
              className="w-full h-10 md:h-12 p-2 pl-4 md:pl-6 text-black bg-white text-base md:text-lg rounded-lg"
              autoComplete="off"
            />
          </section>
          <section className="p-2 overflow-x-auto">
            <table className="min-w-full text-sm md:text-md text-left text-gray-800">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">Codigo</th>
                  <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">Nombre</th>
                  <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">Precio</th>
                  <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">Cantidad</th>
                  <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">Subtotal</th>
                  <th scope="col" className="px-4 md:px-6 py-2 md:py-3 font-bold">Eliminar</th>
                </tr>
              </thead>
              <tbody className="bg-white">
              </tbody>
            </table>
          </section>
        </div>

        <section className="flex flex-col gap-4 md:gap-8 w-full md:w-[20%] p-2">
          <a
            href="https://planetaemx.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="decoration-none"
          >
            <button className="w-full h-12 md:h-16 text-lg md:text-xl bg-amber-400 hover:bg-amber-500 hover:cursor-pointer text-white p-2 rounded-md font-semibold">
              Recargas
            </button>
          </a>
          <div className="flex flex-col items-center bg-white p-2 gap-2 rounded-lg">
            <h2 className="text-2xl md:text-3xl">Total:</h2>
            <h2 className="text-3xl md:text-4xl font-semibold">$1,000.00</h2>
          </div>
          <button className="w-full h-12 md:h-16 text-xl md:text-2xl bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white p-2 rounded-md font-semibold">
            Cobrar
          </button>
        </section>
      </div>
    </main>
  );
}