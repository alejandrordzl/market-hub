import { useUserToken } from ".";
import { MarketHubApiClient } from "../clients/api";

export const useClient = () => {
  const token = useUserToken();
  if (!token) throw new Error("No token found. Please log in.");
  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    throw new Error("Base URL is not defined in environment variables.");
  }
  return new MarketHubApiClient(process.env.NEXT_PUBLIC_BASE_URL, token);
};
