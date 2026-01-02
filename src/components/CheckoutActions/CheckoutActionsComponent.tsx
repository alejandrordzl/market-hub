"use client";
import { useCheckoutModalStore, useSalesStore } from "@/state";
import Modal from "../Modal";
import { useCallback, useState } from "react";
import { confirmPayment } from "./formActions";
import { useSession } from "next-auth/react";

export function CheckoutActionsComponent() {
  const [isReadyToSubmit, setIsReadyToSubmit] = useState<boolean>(false);
  const { data: session } = useSession();
  // Use sales store
  const saleStore = useSalesStore();
  const { sales, total, paymentMethod, amountReceived, change } = saleStore;
  const { setAmountReceived, setChange, clearSale } = saleStore;
  // Use modal store
  const { isModalOpen, setModalOpen } = useCheckoutModalStore();

  const handleConfirmPayment = useCallback(async () => {
    try {
      if (!isReadyToSubmit) {
        return;
      }
      const userId = parseInt(session?.user?.id || "0");
      const result = await confirmPayment(
        userId,
        amountReceived,
        change,
        paymentMethod,
        total,
        sales
      );

      if (result.success) {
        clearSale();
        setModalOpen(false);
        setIsReadyToSubmit(false);
      } else {
        console.error("Error confirming payment:", result.message);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  }, [amountReceived, isReadyToSubmit, change, paymentMethod, sales, session, total, clearSale, setModalOpen]);

  const handleOnKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();

      if (event.key === "Delete" || event.key === "Backspace") {
        setIsReadyToSubmit(false);
        setAmountReceived(0);
        setChange(0);
        return;
      }

      if (event.key === "Enter") {
        const value = parseFloat(event.currentTarget.value || "0");
        setAmountReceived(isNaN(value) ? 0 : value);
        if (value >= total) {
          setIsReadyToSubmit(true);
          setChange(value - total);
        }
        handleConfirmPayment();
      }
    },
    [handleConfirmPayment, total, setIsReadyToSubmit, setChange, setAmountReceived]
  );

  return (
    <section className="flex flex-col gap-4 md:gap-8 w-full md:w-[20%] p-2">
      <RecargasButton />
      <div className="flex flex-col items-center bg-white p-2 gap-2 rounded-lg">
        <h2 className="text-2xl md:text-3xl">Total:</h2>
        <h2 className="text-3xl md:text-4xl font-semibold">
          ${total?.toFixed(2)}
        </h2>
      </div>
      <button
        onClick={() => setModalOpen(true)}
        className="w-full h-12 md:h-16 text-xl md:text-2xl bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white p-2 rounded-md font-semibold"
      >
        Cobrar
      </button>
      <Modal
        onOpen={() => {
          window.document.getElementById("input-amount-received")?.focus();
        }}
        title="Confirmar Pago"
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          setAmountReceived(0);
        }}
      >
        <section className="flex flex-col gap-4">
          <div>
            <h4 className="text-lg font-semibold">Total</h4>
            <span className="text-xl">${total?.toFixed(2)}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Cantidad Recibida</h4>
            <div>
              <span className="pr-1">$</span>
              <input
                id="input-amount-received"
                className="pl-1 border-b border-gray-400 focus:outline-none w-32 text-xl"
                type="number"
                placeholder="0.00"
                defaultValue={amountReceived || ""}
                onKeyUp={handleOnKeyUp}
              />
            </div>
          </div>

          {isReadyToSubmit ? (
            <div>
              <h4 className="text-lg font-semibold">Cambio</h4>
              <span className="text-xl">${change.toFixed(2)}</span>
            </div>
          ) : (
            <div>
              <h4 className="text-lg font-semibold">Faltante</h4>
              <span className="text-xl text-red-500">
                ${(total - amountReceived).toFixed(2)}
              </span>
            </div>
          )}
          <div className="flex justify-end mt-4">
            <button
              disabled={!isReadyToSubmit}
              onClick={() => handleConfirmPayment()}
              className="bg-green-500 text-white p-2 rounded-md hover:cursor-pointer disabled:hover:cursor-default disabled:bg-red-500 disabled:opacity-50"
            >
              {isReadyToSubmit ? "Confirmar Pago" : "Cantidad Insuficiente"}
            </button>
          </div>
        </section>
      </Modal>
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
