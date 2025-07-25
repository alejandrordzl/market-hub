"use client";
import { useSale } from "@/app/hooks/sales";

interface CheckoutActionsComponentProps {
  saleId: string;
}
export default function CheckoutActionsComponent({
  saleId,
}: CheckoutActionsComponentProps) {
  const { sale } = useSale(saleId);
  return (
    <section className="flex flex-col gap-4 md:gap-8 w-full md:w-[20%] p-2">
      <RecargasButton />
      <div className="flex flex-col items-center bg-white p-2 gap-2 rounded-lg">
        <h2 className="text-2xl md:text-3xl">Total:</h2>
        <h2 className="text-3xl md:text-4xl font-semibold">
          ${sale?.total?.toFixed(2)}
        </h2>
      </div>
      <button className="w-full h-12 md:h-16 text-xl md:text-2xl bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white p-2 rounded-md font-semibold">
        Cobrar
      </button>
    </section>
  );
}

const RecargasButton = () => (
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
);
