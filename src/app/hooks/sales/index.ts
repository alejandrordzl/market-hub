'use client';
import { useClient } from "../client";
import useSWR from "swr";

export function useSale(id?: string) {
  if (!id) {
    return {
      sale: undefined,
      isLoading: false,
      isError: false,
    };
  }

  const client = useClient();
  const { data, error } = useSWR(["sales", id], () => client.getSaleById(id));
  return {
    sale: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}