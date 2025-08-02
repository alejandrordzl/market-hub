'use client';
import { Sale } from "@/utils/types";
import useSWR from "swr";

export function useSale(id?: string) {
  return useSWR(["sales", id], async () => {
    const response = await fetch(`/api/v1/sales/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error("Failed to fetch sale");
    const data = await response.json();
    return data as Sale;
  });
}