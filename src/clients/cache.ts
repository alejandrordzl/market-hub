import { Product } from "@/utils/types";
import { unstable_cache } from "next/cache";
import { getProductByBarcode } from "./db";

export async function getCachedProductByBarcode(
    barCode: string
): Promise<Product | undefined> {
    const cachedFn = unstable_cache(
        async (barCode: string) => {
            try {
                console.warn(`Fetching product with barcode ${barCode} from database`);
                const product = await getProductByBarcode(barCode);
                return product;
            } catch (error) {
                console.error(`Error fetching product with barcode ${barCode}:`, error);
                return undefined;
            }
        },
        [`product-barcode-${barCode}`],
        {
            revalidate: false, // only via revalidateTag()
            tags: [`product-barcode-${barCode}`],
        }
    );
    return cachedFn(barCode);
}