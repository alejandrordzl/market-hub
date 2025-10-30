"use client";
import { useSale } from "@/hooks/sales";
import Modal from "./Modal";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

interface CheckoutActionsComponentProps {
  saleId: string;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  createInitialSale: () => Promise<{ id: string } | undefined>;
  setInitialSale: Dispatch<
    SetStateAction<{
      id: string;
    } | null>
  >;
}
export function CheckoutActionsComponent({
  saleId,
  isModalOpen,
  setIsModalOpen,
  createInitialSale,
  setInitialSale,
}: CheckoutActionsComponentProps) {
  const { data } = useSale(saleId);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const amountReceivedRef = useRef<HTMLInputElement>(null);
  const [isReadyToSubmit, setIsReadyToSubmit] = useState<boolean>(false);
  const total = useMemo(() => {
    return data?.total || 0;
  }, [data?.total]);

  const isAmountValid = useMemo(() => {
    return amountReceived >= total;
  }, [total, amountReceived]);

  const change = useMemo(() => {
    return isAmountValid ? amountReceived - total : 0;
  }, [isAmountValid, amountReceived, total]);

  const handleConfirmPayment = useCallback(async () => {
    try {
      if (!isAmountValid) {
        console.log(
          "Amount received is less than total, cannot confirm payment"
        );
        return;
      }

      const response = await fetch(`/api/v1/sales/${saleId}`, {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountReceived,
          change,
          paymentMethod: "CASH",
        }),
      });

      if (response.ok) {
        setIsModalOpen(false);
        setAmountReceived(0);
        const newSale = await createInitialSale();
        setInitialSale({ id: newSale?.id || "" });
      } else {
        console.error("Error confirming payment:", response.statusText);
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  }, [
    amountReceived,
    change,
    createInitialSale,
    isAmountValid,
    saleId,
    setAmountReceived,
    setInitialSale,
    setIsModalOpen,
  ]);

  const handleOnKeyUp = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      event.preventDefault();
      if (event.key === "Enter") {
        const value = parseFloat(amountReceivedRef.current?.value || "0");
        setAmountReceived(isNaN(value) ? 0 : value);

        if (isAmountValid) {
          setIsReadyToSubmit(true);
        }

        if (isReadyToSubmit && isAmountValid) {
          handleConfirmPayment();
        }
      } else {
        setIsReadyToSubmit(false);
      }
    },
    [handleConfirmPayment, isAmountValid, isReadyToSubmit]
  );
  return (
    <section className="flex flex-col gap-4 md:gap-8 w-full md:w-[20%] p-2">
      <RecargasButton />
      <div className="flex flex-col items-center bg-white p-2 gap-2 rounded-lg">
        <h2 className="text-2xl md:text-3xl">Total:</h2>
        <h2 className="text-3xl md:text-4xl font-semibold">
          ${data?.total?.toFixed(2)}
        </h2>
      </div>
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full h-12 md:h-16 text-xl md:text-2xl bg-green-500 hover:bg-green-600 hover:cursor-pointer text-white p-2 rounded-md font-semibold"
      >
        Cobrar
      </button>
      <Modal
        onOpen={() => {
          amountReceivedRef.current?.focus();
        }}
        title="Confirmar Pago"
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setAmountReceived(0);
        }}
      >
        <section className="flex flex-col gap-4">
          <div>
            <h4 className="text-lg font-semibold">Total</h4>
            <span className="text-xl">${data?.total?.toFixed(2)}</span>
          </div>
          <div>
            <h4 className="text-lg font-semibold">Cantidad Recibida</h4>
            <div>
              <span className="pr-1">$</span>
              <input
                className="pl-1 border-b border-gray-400 focus:outline-none w-32 text-xl"
                type="number"
                placeholder="0.00"
                defaultValue={amountReceived || ""}
                onKeyUp={handleOnKeyUp}
                ref={amountReceivedRef}
              />
            </div>
          </div>

          {isAmountValid ? (
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
              disabled={!isAmountValid}
              onClick={() => handleConfirmPayment()}
              className="bg-green-500 text-white p-2 rounded-md hover:cursor-pointer disabled:hover:cursor-default disabled:bg-red-500 disabled:opacity-50"
            >
              {isAmountValid ? "Confirmar Pago" : "Cantidad Insuficiente"}
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
