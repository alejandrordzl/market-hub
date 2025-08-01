'use client';
import useSWR from "swr";

export function useSale(id?: string) {


  const { data, error } = useSWR(["sales", id], async () => {
    const response = await fetch(`/api/v1/sales/${id}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) throw new Error("Failed to fetch sale");
    return response.json();
  });

  return {
    sale: data?.data,
    isLoading: !error && !data,
    isError: error,
  };
}