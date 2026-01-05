"use client";
import { useCheckoutModalStore, useSalesStore } from "@/state";
import Modal from "../Modal";
import { useActionState, useCallback, useEffect, useState } from "react";
import { confirmPaymentAction, ConfirmPaymentState } from "./formActions";
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

  // Use action state for server action
  const [paymentState, formAction, isPending] = useActionState<ConfirmPaymentState, FormData>(
    confirmPaymentAction,
    { status: "idle" }
  );

  // Handle successful payment
  useEffect(() => {
    if (paymentState.status === "success") {
      clearSale();
      setModalOpen(false);
      setIsReadyToSubmit(false);
      setAmountReceived(0);
      setChange(0);
    }
  }, [paymentState, clearSale, setModalOpen, setAmountReceived, setChange]);


  const handleOnKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
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
          // Submit the form
          const form = event.currentTarget.form;
          if (form && !isPending && isReadyToSubmit) {
            form.requestSubmit();
          }
        }
      }
    },
    [total, setIsReadyToSubmit, setChange, setAmountReceived, isPending]
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
          {/* Error Message */}
          {paymentState.status === "error" && paymentState.error && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {paymentState.error}
            </div>
          )}

          <form action={formAction} className="flex flex-col gap-4">
            {/* Hidden fields */}
            <input type="hidden" name="sellerId" value={session?.user?.id || ""} />
            <input type="hidden" name="total" value={total} />
            <input type="hidden" name="paymentMethod" value={paymentMethod} />
            <input type="hidden" name="sales" value={JSON.stringify(sales)} />

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
                  name="amountReceived"
                  className="pl-1 border-b border-gray-400 focus:outline-none w-32 text-xl"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  defaultValue={amountReceived || ""}
                  onKeyUp={handleOnKeyUp}
                  disabled={isPending}
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
                type="submit"
                disabled={!isReadyToSubmit || isPending}
                className="bg-green-500 text-white p-2 rounded-md hover:cursor-pointer disabled:hover:cursor-default disabled:bg-red-500 disabled:opacity-50"
              >
                {isPending
                  ? "Procesando..."
                  : isReadyToSubmit
                    ? "Confirmar Pago"
                    : "Cantidad Insuficiente"}
              </button>
            </div>
          </form>
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
