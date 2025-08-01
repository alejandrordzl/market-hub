'use client';
import { useClient } from "../client";
import useSWR from "swr";

export function useSale(id?: string) {

  const client = useClient();
  const { data, error } = useSWR(["sales", id], () => client.getSaleById(id as string));

  return {
    sale: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}