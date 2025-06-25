import useSWRMutation from "swr/mutation";
import { useClient } from "../client";
import useSWR, { mutate } from "swr";

export const useCurrentSale = () => {
  const client = useClient();
  
  const fetcher = async (key: string) => {
    // Check if we have a current sale ID stored (you might want to store this in localStorage or context)
    const currentSaleId = localStorage.getItem('currentSaleId');
    if (!currentSaleId) return null;
    
    const response = await client.getSaleById(currentSaleId);
    return response.data;
  };

  return useSWR("current-sale", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
};

export const useCreateSale = () => {
    const client = useClient();
    return useSWRMutation("create-sale", async () => {
        const response = await client.createSale();
        return response;
    });
}

export const useAddSaleItem = (saleId: string, productId: string) => {
  const client = useClient();
  return useSWRMutation(["add-sale-item", saleId], async () => {
    const response = await client.addSaleItem(saleId, {
      productId,
      quantity: 1,
    });
    if (response.status === 200) {
      // Update the sale cache after adding the item
      mutate(["sale", saleId]);
    }
    return response;
  });
};
